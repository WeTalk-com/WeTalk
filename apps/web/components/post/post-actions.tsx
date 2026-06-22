"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle } from "lucide-react";
import { likePost, unlikePost } from "@/lib/api";

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
  const [liked, setLiked] = useState(Boolean(likedByMe));
  const [likeCount, setLikeCount] = useState(likes);
  const [pending, setPending] = useState(false);
  const t = useTranslations("app.post");

  // Mise à jour optimiste : bascule immédiate, recalée sur la réponse serveur,
  // rollback si l'appel échoue.
  async function toggleLike() {
    if (pending) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const state = next ? await likePost(postId) : await unlikePost(postId);
      setLiked(state.likedByMe);
      setLikeCount(state.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

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
        className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-live" : "hover:text-live"}`}
      >
        <Heart className={`size-4.5 transition-colors ${liked ? "fill-live" : ""}`} />
        <span className="tabular-nums">{formatCount(likeCount)}</span>
      </button>
    </div>
  );
}
