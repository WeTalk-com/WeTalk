"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle } from "lucide-react";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

type Props = {
  likes: number;
  comments: number;
  onComment?: () => void;
};

export function PostActions({ likes, comments, onComment }: Props) {
  const [liked, setLiked] = useState(false);
  const t = useTranslations("app.post");

  return (
    <div className="flex items-center gap-5 text-brown-sec">
      <button
        type="button"
        aria-label={t("comment")}
        onClick={onComment}
        className="flex items-center gap-1.5 text-sm transition-colors hover:text-gold"
      >
        <MessageCircle className="size-4.5" />
        <span className="tabular-nums">{formatCount(comments)}</span>
      </button>

      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        aria-label={t("like")}
        className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-live" : "hover:text-live"}`}
      >
        <Heart className={`size-4.5 transition-colors ${liked ? "fill-live" : ""}`} />
        <span className="tabular-nums">{formatCount(likes + (liked ? 1 : 0))}</span>
      </button>
    </div>
  );
}
