"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/components/SessionProvider";

type PresenceUser = {
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

type PresenceContextValue = {
  onlineUsers: Record<string, PresenceUser>;
};

const PresenceContext = createContext<PresenceContextValue | undefined>(undefined);

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used within PresenceProvider");
  }
  return ctx;
}

export default function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser>>({});

  useEffect(() => {
    if (!user) {
      setOnlineUsers({});
      return;
    }

    let isMounted = true;

    const channel = supabase.channel("presence", { config: { presence: { key: user.id } } });

    const syncState = () => {
      if (!isMounted) return;
      const state = channel.presenceState() as Record<string, PresenceUser[]>;
      const flattened = Object.values(state).flat();
      const mapped = flattened.reduce((acc, entry) => {
        if (entry?.user_id) {
          acc[entry.user_id] = entry;
        }
        return acc;
      }, {} as Record<string, PresenceUser>);
      setOnlineUsers(mapped);
    };

    channel
      .on("presence", { event: "sync" }, syncState)
      .on("presence", { event: "join" }, syncState)
      .on("presence", { event: "leave" }, syncState);

    const subscription = channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({
          user_id: user.id,
          full_name: userProfile?.full_name ?? user.email ?? "",
          avatar_url: userProfile?.avatar_url ?? null
        });
      }
    });

    return () => {
      isMounted = false;
      setOnlineUsers({});
      supabase.removeChannel(subscription);
    };
  }, [user, userProfile]);

  const value = useMemo(() => ({ onlineUsers }), [onlineUsers]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}
