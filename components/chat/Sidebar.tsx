"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hash, Plus, Settings, ChevronDown, MoreHorizontal, History as HistoryIcon } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { usePathname } from "next/navigation";
import { useChannels } from "@/components/chat/ChannelsProvider";
import LogoutButton from "@/components/LogoutButton";
import { usePresence } from "@/components/PresenceProvider";
import { getDisplayName, getInitials } from "@/components/chat/utils/getDisplayName";

export default function Sidebar() {
  const { user, userProfile } = useSession();
  const { joinedChannels, leaveChannel } = useChannels();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { onlineUsers } = usePresence();

  const isOnline = user?.id ? onlineUsers[user.id] !== undefined : false;
  const displayName = getDisplayName(userProfile, user);
  const displayEmail = userProfile?.email ?? user?.email ?? "";
  const initials = getInitials(displayName || displayEmail);

  return (
    <aside className="w-64 h-full sidebar-gradient flex flex-col border-r border-sidebar-border">
      {/* Workspace Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <button className="flex items-center gap-2 hover:bg-sidebar-accent/50 rounded-lg px-2 py-1.5 transition-colors -ml-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
            W
          </div>
          <span className="text-sidebar-foreground font-bold text-sm">Workspace</span>
          <ChevronDown className="w-4 h-4 text-sidebar-muted" />
        </button>
        <div className="flex items-center gap-1">
          <LogoutButton />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground text-sm font-medium ring-2 ring-sidebar-ring/20">
              {initials}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar-bg ${isOnline ? "bg-online" : "bg-muted"
                }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{displayName}</p>
            <p className="text-sidebar-muted text-xs truncate">{displayEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
        <div className="px-3 space-y-1">
          <Link
            href="/channels"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${pathname === "/channels"
                ? "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
          >
            <Hash className="w-4 h-4" />
            <span className="text-sm">All Channels</span>
          </Link>
          <Link
            href="/channels/history"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${pathname === "/channels/history"
                ? "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="text-sm">History</span>
          </Link>
        </div>

        <div className="px-3 mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              Joined Channels
            </span>
            <Link href="/channels/create" className="p-1 hover:bg-sidebar-accent rounded transition-colors" title="Create Channel">
              <Plus className="w-4 h-4 text-sidebar-muted hover:text-sidebar-foreground" />
            </Link>
          </div>

          <div className="space-y-1">
            {joinedChannels.length === 0 ? (
              <p className="text-xs text-sidebar-muted px-3">No channels joined yet.</p>
            ) : (
              joinedChannels.map((channel) => {
                const isActive = pathname === `/channels/${channel.id}`;
                return (
                  <div key={channel.id} className="relative group">
                    <Link
                      href={`/channels/${channel.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                          : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}
                    >
                      <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
                      <span className="text-sm truncate flex-1">{channel.name}</span>
                      {/* Placeholder for unread count if we had it */}
                      {/* <span className="w-5 h-5 flex items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium rounded-full">3</span> */}
                    </Link>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-sidebar-hover text-sidebar-muted opacity-0 group-hover:opacity-100 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenu((prev) => (prev === channel.id ? null : channel.id));
                      }}
                      aria-label="Channel menu"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === channel.id && (
                      <div className="absolute right-2 top-9 z-20 w-40 rounded-lg border border-sidebar-border bg-sidebar shadow-lg p-1 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            leaveChannel(channel.id);
                            setOpenMenu(null);
                          }}
                        >
                          Leave Channel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
