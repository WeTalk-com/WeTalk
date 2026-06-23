"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { likePost, unlikePost } from "@/lib/api";

type Props = {
  postId: string;
  likes: number;
  likedByMe?: boolean;
  comments: number;
  shares: number;
  onComment?: () => void;
};

export function PostActions({ postId, likes, likedByMe, comments, shares, onComment }: Props) {
  const [liked, setLiked] = useState(Boolean(likedByMe));
  const [likeCount, setLikeCount] = useState(likes);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const t = useTranslations("app.post");

  // Mise à jour optimiste : on bascule l'UI tout de suite, on cale sur la réponse
  // serveur, et on annule si l'appel échoue.
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
    <div className="flex items-center gap-6 text-ink-soft text-sm">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={t("like")}
        className="flex items-center gap-2 hover:text-live transition-colors"
      >
        <Heart
          className={`size-5 ${liked ? "fill-live text-live" : ""}`}
        />
        {likeCount}
      </button>

      <button
        type="button"
        aria-label={t("comment")}
        onClick={onComment}
        className="flex items-center gap-2 hover:text-ink transition-colors"
      >
        <MessageCircle className="size-5" />
        {comments}
      </button>

      <button
        type="button"
        aria-label={t("share")}
        className="flex items-center gap-2 hover:text-ink transition-colors"
      >
        <Send className="size-5" />
        {shares}
      </button>

      <button
        type="button"
        onClick={() => setSaved((v) => !v)}
        aria-pressed={saved}
        aria-label={t("save")}
        className="ml-auto hover:text-gold transition-colors"
      >
        <Bookmark className={`size-5 ${saved ? "fill-gold text-gold" : ""}`} />
      </button>
    </div>
  );
}
