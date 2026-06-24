"use client";

import { useTranslations } from "next-intl";
import { Heart, MessageCircle } from "lucide-react";
import { likePost, unlikePost } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useOptimisticLike } from "@/hooks/use-optimistic-like";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

type Props = {
  postId: string;
  likes: number;
  likedByMe?: boolean;
  comments: number;
  onComment?: () => void;
};

export function PostActions({ postId, likes, likedByMe, comments, onComment }: Props) {
  const t = useTranslations("app.post");
  const { liked, count: likeCount, pending, toggle: toggleLike } = useOptimisticLike({
    initial: Boolean(likedByMe),
    initialCount: likes,
    onToggle: (next) => next ? likePost(postId) : unlikePost(postId),
  });

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
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={t("like")}
        className={cn("flex items-center gap-1.5 text-sm transition-colors", liked ? "text-live" : "hover:text-live")}
      >
        <Heart className={cn("size-4.5 transition-colors", liked && "fill-live")} />
        <span className="tabular-nums">{formatCount(likeCount)}</span>
      </button>
    </div>
  );
}
