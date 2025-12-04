"use client";

type Profile = {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
} | null;

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, any>;
} | null;

export function getDisplayName(profile?: Profile, user?: UserLike): string {
  const name =
    profile?.full_name?.trim() ||
    (user?.user_metadata as any)?.full_name?.trim?.() ||
    (user?.user_metadata as any)?.name?.trim?.() ||
    profile?.email?.trim() ||
    user?.email?.trim();

  return name && name.length > 0 ? name : "Unknown User";
}

export function getInitials(nameOrEmail?: string | null): string {
  const str = nameOrEmail?.trim();
  if (!str) return "U";

  const parts = str.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return str[0].toUpperCase();
}
