"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useChannels } from "@/components/chat/ChannelsProvider";
import TopNav from "@/components/chat/TopNav";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useSession } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabaseClient";

type MessageType = {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  text?: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
    email?: string | null;
  } | null;
};

function dedupe(list: MessageType[]) {
  const map = new Map<string, MessageType>();
  list.forEach((m) => {
    if (m && m.id) {
      map.set(m.id, m);
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}



async function fetchProfiles(userIds: string[], supabase: any) {
  if (userIds.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .in("id", userIds);

  const map: Record<string, any> = {};
  data?.forEach((p: any) => {
    map[p.id] = p;
  });
  return map;
}

export default function ChannelViewPage() {
  const params = useParams();
  const channelId = params?.id as string;
  const { user, userProfile } = useSession();
  const { allChannels, joinedChannelIds, joinChannel, leaveChannel } = useChannels();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [oldestMessage, setOldestMessage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesRef = useRef<MessageType[]>([]);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const channel = allChannels.find((c) => c.id === channelId);
  const joined = joinedChannelIds.has(channelId);

  useEffect(() => {
    if (!channelId || !joined) {
      setMessages([]);
      setOldestMessage(null);
      setHasMore(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const loadMessages = async () => {
      if (!mounted) return;
      // 1. Fetch messages without join
      const { data, error } = await supabase
        .from("messages")
        .select("id, channel_id, user_id, content, created_at")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("LOAD", JSON.stringify(error, null, 2));
        setLoading(false);
        return;
      }

      const msgs = (data ?? []) as MessageType[];

      // 2. Fetch profiles manually
      const userIds = Array.from(new Set(msgs.map(m => m.user_id)));
      const profileMap = await fetchProfiles(userIds, supabase);

      // 3. Attach profiles
      const enriched = msgs.map(m => ({
        ...m,
        profiles: {
          full_name: profileMap[m.user_id]?.full_name ?? m.user_id,
          email: profileMap[m.user_id]?.email ?? null,
          avatar_url: profileMap[m.user_id]?.avatar_url ?? null
        }
      }));

      const deduped = dedupe(enriched);
      messagesRef.current = deduped;
      setMessages(deduped);
      setOldestMessage(deduped[0]?.created_at ?? null);
      setHasMore(msgs.length === 50);
      setLoading(false);
    };

    loadMessages();

    const dbChannel = supabase
      .channel(`messages-db-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // For real-time, we might need to fetch the single profile if not known,
          // or just use a placeholder until next load. 
          // Ideally we fetch it:
          const newMsg = payload.new as MessageType;
          const profileMap = await fetchProfiles([newMsg.user_id], supabase);
          const enriched = {
            ...newMsg,
            profiles: {
              full_name: profileMap[newMsg.user_id]?.full_name ?? newMsg.user_id,
              email: profileMap[newMsg.user_id]?.email ?? null,
              avatar_url: profileMap[newMsg.user_id]?.avatar_url ?? null
            }
          };
          messagesRef.current = dedupe([...messagesRef.current, enriched]);
          setMessages(messagesRef.current);
        }
      )
      .subscribe();

    const bcChannel = supabase
      .channel(`messages-bc-${channelId}`)
      .on("broadcast", { event: "new-message" }, async ({ payload }) => {
        const newMsg = payload as MessageType;
        if (messagesRef.current.some((m) => m.id === newMsg.id)) return;
        // Broadcast usually sends the full enriched object, so we might be good.
        // If not, we'd enrich it.
        messagesRef.current = dedupe([...messagesRef.current, newMsg]);
        setMessages(messagesRef.current);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(bcChannel);
    };
  }, [channelId, joined]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore || !oldestMessage) return;
    setLoadingMore(true);

    const { data, error } = await supabase
      .from("messages")
      .select("id, channel_id, user_id, content, created_at")
      .eq("channel_id", channelId)
      .lt("created_at", oldestMessage)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("LOAD", JSON.stringify(error, null, 2));
      setLoadingMore(false);
      return;
    }

    const msgs = (data ?? []) as MessageType[];
    if (msgs.length === 0) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    const userIds = Array.from(new Set(msgs.map(m => m.user_id)));
    const profileMap = await fetchProfiles(userIds, supabase);

    const reversed = msgs.reverse();
    const enriched = reversed.map(m => ({
      ...m,
      profiles: {
        full_name: profileMap[m.user_id]?.full_name ?? m.user_id,
        email: profileMap[m.user_id]?.email ?? null,
        avatar_url: profileMap[m.user_id]?.avatar_url ?? null
      }
    }));

    setMessages((prev) => {
      const merged = dedupe([...enriched, ...prev]);
      messagesRef.current = merged;
      return merged;
    });
    setOldestMessage(enriched[0]?.created_at ?? oldestMessage);
    setHasMore(msgs.length === 50);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (!topRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadOlderMessages();
      },
      { threshold: 1 }
    );
    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [topRef.current, oldestMessage, hasMore]);

  const handleSend = async (text: string) => {
    if (!joined || !text.trim() || !user) return;
    const now = new Date().toISOString();
    const tempId = "temp-" + Date.now();

    // Use local user profile for optimistic update
    const optimistic: MessageType = {
      id: tempId,
      channel_id: channelId,
      user_id: user.id,
      content: text,
      created_at: now,
      profiles: {
        full_name: userProfile?.full_name ?? user.email ?? user.id,
        email: user.email,
        avatar_url: userProfile?.avatar_url ?? null
      }
    };

    messagesRef.current = dedupe([...messagesRef.current, optimistic]);
    setMessages(messagesRef.current);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        user_id: user.id,
        content: text
      })
      .select("id, channel_id, user_id, content, created_at")
      .single();

    if (error || !inserted) {
      console.error("send message db error", error);
      return;
    }

    // Combine inserted data with local profile for the final message object
    const finalMsg: MessageType = {
      ...(inserted as MessageType),
      profiles: optimistic.profiles
    };

    messagesRef.current = dedupe(
      messagesRef.current.map((m) => (m.id === tempId ? finalMsg : m))
    );
    setMessages(messagesRef.current);

    // broadcast after successful insert for instant echo to other tabs/clients
    await supabase.channel(`messages-bc-${channelId}`).send({
      type: "broadcast",
      event: "new-message",
      payload: finalMsg
    });
  };

  const joinGate = (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold">
        {channel?.is_private ? "This is a private channel." : "Join this channel to view messages."}
      </h2>
      <p className="text-muted-foreground">
        {channel?.is_private
          ? "You must join to view messages."
          : "Join to start participating in this conversation."}
      </p>
      <button
        onClick={() => joinChannel(channelId)}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded"
      >
        Join Channel
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <TopNav
        title={channel?.name ?? "Channel"}
        subtitle={channel?.description ?? ""}
        showChannelInfo
        memberCount={channel?.member_count ?? 0}
        rightActions={
          joined ? (
            <button
              onClick={() => leaveChannel(channelId)}
              className="px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent"
            >
              Leave
            </button>
          ) : (
            <button
              onClick={() => joinChannel(channelId)}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
            >
              Join
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="text-muted-foreground">Loading messages...</div>
        ) : joined ? (
          <>
            <div ref={topRef}></div>
            <MessageList
              messages={messages.map((m) => ({
                ...m,
                content: m.content ?? m.text ?? "",
                profiles: m.profiles ?? null
              }))}
            />
            <div ref={bottomRef} />
          </>
        ) : (
          joinGate
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <MessageInput
          placeholder={`Message #${channel?.name ?? "channel"}`}
          onSend={handleSend}
          disabled={!joined}
        />
      </div>
    </div>
  );
}
