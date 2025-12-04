"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hash, Lock, MoreHorizontal } from "lucide-react";

type Channel = {
  id: string;
  name: string;
  description?: string | null;
  member_count?: number;
  is_private?: boolean;
  created_at?: string;
};

type Props = {
  channel: Channel;
  joined: boolean;
  onJoin: () => void;
  onLeave: () => void;
};

export default function ChannelListItem({ channel, joined, onJoin, onLeave }: Props) {
  const [open, setOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleAction = (action: "join" | "leave") => {
    if (action === "join") onJoin();
    else onLeave();
    setOpen(false);
  };

  return (
    <div className="relative group flex items-center gap-4 p-4 bg-card hover:bg-channel-hover border border-border rounded-lg transition-all duration-200 hover:shadow-sm">
      <Link href={`/channels/${channel.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            channel.is_private ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          {channel.is_private ? <Lock className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground font-medium text-sm group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            {channel.is_private && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Private</span>
            )}
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {joined ? "Joined" : "Not joined"}
            </span>
          </div>
          {channel.description && (
            <p className="text-muted-foreground text-sm mt-0.5 truncate">{channel.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {channel.member_count ? <span>{channel.member_count} members</span> : null}
            {channel.created_at ? <span>Created {channel.created_at}</span> : null}
          </div>
        </div>
      </Link>

      <button
        className="p-2 hover:bg-accent rounded-md transition-all"
        onClick={toggleMenu}
        aria-label="Channel actions"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-3 top-12 z-20 w-40 rounded-md border border-border bg-card shadow-md">
          <button
            className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
            onClick={() => handleAction(joined ? "leave" : "join")}
          >
            {joined ? "Leave Channel" : "Join Channel"}
          </button>
        </div>
      )}
    </div>
  );
}
