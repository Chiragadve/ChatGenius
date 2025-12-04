"use client";

import React from "react";
import { Hash, Star, Users, Search, Bell, Settings } from "lucide-react";
import { usePresence } from "@/components/PresenceProvider";
import { useSession } from "@/components/SessionProvider";
import { getDisplayName, getInitials } from "@/components/chat/utils/getDisplayName";

interface TopNavProps {
  title: string;
  subtitle?: string;
  showChannelInfo?: boolean;
  memberCount?: number;
  rightActions?: React.ReactNode;
}

export default function TopNav({ title, subtitle, showChannelInfo = false, memberCount = 0, rightActions }: TopNavProps) {
  const { onlineUsers } = usePresence();
  const { user, userProfile } = useSession();
  const displayName = getDisplayName(userProfile, user);
  const initials = getInitials(displayName || user?.email || userProfile?.email);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        {showChannelInfo && <Hash className="w-5 h-5 text-primary" />}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground font-semibold text-lg tracking-tight">{title}</h1>
            {showChannelInfo && (
              <button className="text-muted-foreground hover:text-yellow-500 transition-colors p-1 rounded-md hover:bg-accent/50">
                <Star className="w-4 h-4" />
              </button>
            )}
          </div>
          {subtitle && <p className="text-muted-foreground text-xs line-clamp-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showChannelInfo && (
          <div className="flex items-center gap-3 bg-accent/50 px-3 py-1.5 rounded-lg border border-border/50">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">{memberCount}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-online shadow-[0_0_8px_hsl(142,76%,45%,0.5)]" />
              <span className="text-xs text-muted-foreground font-medium">
                {Object.keys(onlineUsers).length} online
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 border-l border-border pl-3 ml-1">
          {rightActions && (
            <div className="mr-2">
              {rightActions}
            </div>
          )}
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ml-1 ring-1 ring-primary/20">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
