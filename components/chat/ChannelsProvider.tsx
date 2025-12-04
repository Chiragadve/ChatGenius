"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/components/SessionProvider";

type Channel = {
  id: string;
  name: string;
  description?: string | null;
  is_private?: boolean;
  created_at?: string;
  member_count?: number;
};

type ChannelsContextValue = {
  allChannels: Channel[];
  joinedChannels: Channel[];
  joinedChannelIds: Set<string>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
};

const ChannelsContext = createContext<ChannelsContextValue | undefined>(undefined);

export function useChannels() {
  const ctx = useContext(ChannelsContext);
  if (!ctx) {
    throw new Error("useChannels must be used within ChannelsProvider");
  }
  return ctx;
}

export default function ChannelsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const joinedChannels = useMemo(
    () => allChannels.filter((c) => joinedIds.has(c.id)),
    [allChannels, joinedIds]
  );

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const [{ data: channelsData, error: chErr }, { data: memberData, error: memErr }] =
        await Promise.all([
          supabase.from<Channel>("channels_with_count").select("*").order("created_at", { ascending: true }),
          supabase
            .from<{ channel_id: string }>("channel_members")
            .select("channel_id")
            .eq("user_id", user.id)
        ]);

      if (chErr) console.error("channels load error", chErr);
      if (memErr) console.error("memberships load error", memErr);

      if (mounted) {
        setAllChannels(channelsData ?? []);
        setJoinedIds(new Set(memberData?.map((m) => m.channel_id) ?? []));
      }
    };

    load();

    const channelSub = supabase
      .channel("table-db-changes-channels")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channels" }, (payload) => {
        setAllChannels((prev) => {
          if (prev.find((c) => c.id === (payload.new as any).id)) return prev;
          return [...prev, payload.new as Channel];
        });
      })
      .subscribe();

    const memberSub = supabase
      .channel("table-db-changes-channel-members")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_members" }, (payload) => {
        const row = payload.new as { channel_id: string; user_id: string };
        if (row.user_id === user.id) {
          setJoinedIds((prev) => new Set(prev).add(row.channel_id));
          // ensure channel exists locally; fetch if missing
          setAllChannels((prev) => {
            if (prev.find((c) => c.id === row.channel_id)) return prev;
            // fetch channel async without blocking state updates
            supabase
              .from<Channel>("channels_with_count")
              .select("*")
              .eq("id", row.channel_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setAllChannels((curr) => (curr.find((c) => c.id === data.id) ? curr : [...curr, data]));
                }
              });
            return prev;
          });
        }
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "channel_members" }, (payload) => {
        const row = payload.old as { channel_id: string; user_id: string };
        if (row.user_id === user.id) {
          setJoinedIds((prev) => {
            const next = new Set(prev);
            next.delete(row.channel_id);
            return next;
          });
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channelSub);
      supabase.removeChannel(memberSub);
    };
  }, [user]);

  const joinChannel = async (channelId: string) => {
    if (!user || joinedIds.has(channelId)) return;
    const { error } = await supabase.from("channel_members").insert({
      channel_id: channelId,
      user_id: user.id
    });
    if (error) {
      // if already joined (unique constraint), just sync state
      if ((error as any).code === "23505") {
        setJoinedIds((prev) => new Set(prev).add(channelId));
        return;
      }
      console.error("joinChannel error", error);
      return;
    }
    setJoinedIds((prev) => new Set(prev).add(channelId));
  };

  const leaveChannel = async (channelId: string) => {
    if (!user || !joinedIds.has(channelId)) return;
    const { error } = await supabase
      .from("channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", user.id);
    if (error) {
      console.error("leaveChannel error", error);
      return;
    }
    setJoinedIds((prev) => {
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      allChannels,
      joinedChannels,
      joinedChannelIds: joinedIds,
      joinChannel,
      leaveChannel
    }),
    [allChannels, joinedChannels, joinedIds]
  );

  return <ChannelsContext.Provider value={value}>{children}</ChannelsContext.Provider>;
}
