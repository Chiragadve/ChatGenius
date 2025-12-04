"use client";

import React from "react";
import MessageBubble from "./MessageBubble";

type Msg = {
  id: string;
  user_id: string;
  content: string;
  created_at?: string;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

// Compute safe display name for each message
const getDisplayName = (msg: any) => {
  if (msg.profiles?.full_name && msg.profiles.full_name.trim() !== "") {
    return msg.profiles.full_name;
  }

  // fallback if the user has no full_name set
  if (msg.profiles?.email) {
    return msg.profiles.email;
  }

  // final fallback (never show UUID unless absolutely necessary)
  return msg.user_email || msg.email || msg.user_id;
};

export default function MessageList({ messages }: { messages: Msg[] }) {
  return (
    <div className="space-y-1 pb-4">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          msg={{
            ...m,
            profiles: {
              ...(m.profiles ?? {}),
              full_name: getDisplayName(m)
            }
          }}
        />
      ))}
    </div>
  );
}
