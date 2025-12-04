"use client";

import React from "react";
import { getDisplayName, getInitials } from "./utils/getDisplayName";
import { Smile, MessageSquare, MoreHorizontal, Reply } from "lucide-react";
import { useSession } from "@/components/SessionProvider";

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

export default function MessageBubble({ msg }: { msg: Msg }) {
  const { user } = useSession();
  const displayName = getDisplayName(msg.profiles, { email: msg.user_id });
  const initials = getInitials(displayName || msg.user_id);
  const isOwn = user?.id === msg.user_id;

  return (
    <div className={`group flex gap-4 px-4 py-2 hover:bg-accent/30 transition-colors relative -mx-4 rounded-lg ${isOwn ? "bg-primary/5" : ""}`}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ring-1 ring-inset ${isOwn
            ? "bg-primary text-primary-foreground ring-primary/20"
            : "bg-secondary text-secondary-foreground ring-white/10"
          }`}>
          {initials}
        </div>
        {/* Status dot placeholder */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-online rounded-full ring-2 ring-background" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-semibold hover:underline cursor-pointer ${isOwn ? "text-primary" : "text-foreground"
            }`}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ""}
          </span>
        </div>
        <p className="text-foreground/90 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
        </p>
      </div>

      {/* Hover Action Bar */}
      <div className="absolute right-4 top-[-12px] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-sm p-0.5">
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Add reaction">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Reply in thread">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Reply">
            <Reply className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="More">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
