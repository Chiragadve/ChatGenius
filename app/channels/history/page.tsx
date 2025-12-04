"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabaseClient";
import TopNav from "@/components/chat/TopNav";
import Link from "next/link";
import { format } from "date-fns";

type HistoryMessage = {
    id: string;
    content: string;
    created_at: string;
    channel_id: string;
    channels: {
        name: string;
    } | null;
};

export default function HistoryPage() {
    const { user } = useSession();
    const [messages, setMessages] = useState<HistoryMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        if (!user) return;
        loadMessages(0, true);
    }, [user]);

    const loadMessages = async (pageIndex: number, reset = false) => {
        if (!user) return;
        if (pageIndex > 0) setLoadingMore(true);

        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from("messages")
            .select(`
        id,
        content,
        created_at,
        channel_id,
        channels (
          name
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error loading history", error);
            setLoading(false);
            setLoadingMore(false);
            return;
        }

        const newMessages = (data as any[])?.map(m => ({
            ...m,
            channels: Array.isArray(m.channels) ? m.channels[0] : m.channels
        })) as HistoryMessage[];

        if (newMessages.length < PAGE_SIZE) {
            setHasMore(false);
        }

        setMessages(prev => reset ? newMessages : [...prev, ...newMessages]);
        setLoading(false);
        setLoadingMore(false);
        setPage(pageIndex);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadMessages(page + 1);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <TopNav title="Your History" subtitle="Archive of all your sent messages" />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center text-muted-foreground py-8">Loading history...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No message history found.</div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div key={msg.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <Link
                                            href={`/channels/${msg.channel_id}`}
                                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                        >
                                            <span>#</span>
                                            {msg.channels?.name ?? "Unknown Channel"}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(msg.created_at), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            ))}

                            {hasMore && (
                                <div className="text-center pt-4">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? "Loading..." : "Load More"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
