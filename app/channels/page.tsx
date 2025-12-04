"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/chat/TopNav";
import ChannelListItem from "@/components/chat/ChannelListItem";
import { useChannels } from "@/components/chat/ChannelsProvider";

export default function ChannelsPage() {
  const { allChannels, joinedChannelIds, joinChannel, leaveChannel } = useChannels();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => allChannels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [allChannels, search]
  );

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Channels" subtitle={`${allChannels.length} channels`} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">All Channels</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Browse and join channels to collaborate with your team
              </p>
            </div>
            <Link href="/channels/create" className="inline-flex">
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded">
                Create Channel
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <input
                placeholder="Search channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 w-full rounded-md border border-input bg-card px-3 py-2"
              />
            </div>
            <div>
              <button className="px-3 py-2 rounded border border-input bg-background">Filter</button>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground">No channels found</div>
            ) : (
              filtered.map((channel) => (
                <div key={channel.id}>
                  <ChannelListItem
                    channel={channel}
                    joined={joinedChannelIds.has(channel.id)}
                    onJoin={() => joinChannel(channel.id)}
                    onLeave={() => leaveChannel(channel.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
