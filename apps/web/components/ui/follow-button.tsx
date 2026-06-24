"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Check } from "lucide-react";
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

  // Abonné = contour + coche (badge style LinkedIn) ; sinon plein brun + plus.
  const colorClass = following
    ? "border border-border bg-card text-brown"
    : "bg-brown text-canvas";

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? t("unfollow") : t("follow")}
      disabled={pending}
      onClick={toggle}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold transition-colors disabled:opacity-60",
        sizeClass,
        colorClass,
      )}
    >
      {following ? <Check className="size-4" /> : <Plus className="size-4" />}
      {following ? t("following") : t("follow")}
    </button>
  );
}
