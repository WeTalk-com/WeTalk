"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { followUser, unfollowUser } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";

type Props = {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
  onFollow?: () => void;
  onUnfollow?: () => void;
};

export function FollowButton({ userId, initialFollowing = false, size = "sm", onFollow, onUnfollow }: Props) {
  const t = useTranslations("app.rightRail");
  const [following, setFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    const next = !following;
    setFollowing(next);
    try {
      await (next ? followUser(userId) : unfollowUser(userId));
      if (next) onFollow?.(); else onUnfollow?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // 400 = déjà dans l'état cible — on garde l'UI optimiste.
        return;
      }
      setFollowing(!next);
    } finally {
      setPending(false);
    }
  }

  const sizeClass = size === "sm"
    ? "px-4 py-1.5 text-sm"
    : "px-5 py-2 text-base";

  const label = following
    ? hovered ? t("unfollow") : t("following")
    : t("follow");

  const colorClass = following
    ? hovered
      ? "border border-live/40 bg-live/10 text-live hover:bg-live/15"
      : "border border-border bg-card text-brown"
    : "bg-brown text-canvas hover:bg-brown/90";

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={label}
      disabled={pending}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("shrink-0 rounded-full font-semibold transition-colors disabled:opacity-60", sizeClass, colorClass)}
    >
      {label}
    </button>
  );
}
