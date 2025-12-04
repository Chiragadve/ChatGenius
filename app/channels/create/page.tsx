"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/components/SessionProvider";
import TopNav from "@/components/chat/TopNav";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CreateChannelPage() {
  const { user } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }

    const slug = slugify(name);

    setLoading(true);

    try {
      // prefer RPC to make creation + join atomic
      const { data, error: rpcError } = await supabase.rpc("create_channel_with_member", {
        p_name: name,
        p_slug: slug,
        p_is_private: isPrivate,
        p_user: user.id
      });

      if (rpcError) {
        // fallback to insert if RPC not present
        console.warn("rpc error", rpcError);
        const { data: chData, error: chErr } = await supabase
          .from("channels")
          .insert({ name, slug, is_private: isPrivate })
          .select()
          .single();

        if (chErr) throw chErr;
        const { error: memErr } = await supabase
          .from("channel_members")
          .insert({ user_id: user.id, channel_id: chData.id });
        if (memErr && (memErr as any).code !== "23505") {
          throw memErr;
        }
        router.push(`/channels/${chData.id}`);
      } else {
        const channelId = Array.isArray(data) ? data[0].channel_id : data.channel_id;
        const { error: memErr } = await supabase
          .from("channel_members")
          .insert({ user_id: user.id, channel_id: channelId });
        if (memErr && (memErr as any).code !== "23505") {
          throw memErr;
        }
        router.push(`/channels/${channelId}`);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create channel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Create Channel" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-foreground">Create a New Channel</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Channel Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">#</span>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. marketing"
                    className="pl-7 w-full rounded-md border border-input px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Visibility</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex-1 p-3 rounded-lg border ${
                      !isPrivate ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex-1 p-3 rounded-lg border ${isPrivate ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {error && <div className="text-sm text-destructive">{error}</div>}

              <div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
                  {loading ? "Creating..." : "Create Channel"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
