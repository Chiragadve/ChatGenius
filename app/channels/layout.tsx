"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import AppLayout from "@/components/chat/AppLayout";
import ChannelsProvider from "@/components/chat/ChannelsProvider";
import PresenceProvider from "@/components/PresenceProvider";

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user === null) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || user === null) return null;

  return (
    <PresenceProvider>
      <ChannelsProvider>
        <AppLayout>{children}</AppLayout>
      </ChannelsProvider>
    </PresenceProvider>
  );
}
