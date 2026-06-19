"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  /** ID de l'utilisateur à suivre — sera passé à l'API (POST /users/:id/follow). */
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
};

/**
 * Bouton Suivre / Suivi avec toggle optimiste.
 * En mode mock, l'état est local. Le back-end n'a qu'à brancher onFollow/onUnfollow.
 */
export function FollowButton({ userId: _userId, initialFollowing = false, size = "sm" }: Props) {
  const t = useTranslations("app.rightRail");
  const [following, setFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);

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
      onClick={() => setFollowing((v) => !v)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`shrink-0 rounded-full font-semibold transition-colors ${sizeClass} ${colorClass}`}
    >
      {label}
    </button>
  );
}
