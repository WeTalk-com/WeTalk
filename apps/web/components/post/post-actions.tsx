"use client";

import { useTranslations } from "next-intl";
import * as Tooltip from "@radix-ui/react-tooltip";
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
  const { liked, count: likeCount, toggle: toggleLike } = useOptimisticLike({
    initial: Boolean(likedByMe),
    initialCount: likes,
    onToggle: (next) => next ? likePost(postId) : unlikePost(postId),
  });

  return (
    <div className="flex items-center gap-8 text-brown-sec">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={t("comment")}
            onClick={onComment}
            className="flex items-center gap-1.5 text-sm transition-colors"
          >
            <MessageCircle className="size-5.5" />
            <span className="tabular-nums">{formatCount(comments)}</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content sideOffset={6} className="z-50 rounded-lg bg-brown px-2.5 py-1.5 text-xs font-medium text-canvas shadow-md">
            {t("comment")}
            <Tooltip.Arrow className="fill-brown" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={t("like")}
            className={cn("flex items-center gap-1.5 text-sm transition-colors", liked && "text-live")}
          >
            <Heart className={cn("size-5.5 transition-colors", liked && "fill-live like-pop")} />
            <span className="tabular-nums">{formatCount(likeCount)}</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content sideOffset={6} className="z-50 rounded-lg bg-brown px-2.5 py-1.5 text-xs font-medium text-canvas shadow-md">
            {liked ? t("unlike") : t("like")}
            <Tooltip.Arrow className="fill-brown" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  );
}
