"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

type Props = {
  likes: number;
  comments: number;
  shares: number;
};

export function PostActions({ likes, comments, shares }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center gap-6 text-ink-soft text-sm">
      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        className="flex items-center gap-2 hover:text-live transition-colors"
      >
        <Heart
          className={`size-5 ${liked ? "fill-live text-live" : ""}`}
        />
        {likes + (liked ? 1 : 0)}
      </button>

      <button
        type="button"
        className="flex items-center gap-2 hover:text-ink transition-colors"
      >
        <MessageCircle className="size-5" />
        {comments}
      </button>

      <button
        type="button"
        className="flex items-center gap-2 hover:text-ink transition-colors"
      >
        <Send className="size-5" />
        {shares}
      </button>

      <button
        type="button"
        onClick={() => setSaved((v) => !v)}
        aria-pressed={saved}
        aria-label="Save"
        className="ml-auto hover:text-gold transition-colors"
      >
        <Bookmark className={`size-5 ${saved ? "fill-gold text-gold" : ""}`} />
      </button>
    </div>
  );
}
