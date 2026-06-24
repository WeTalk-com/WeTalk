"use client";

import { useState } from "react";
import type { LikeState } from "@/lib/api/posts";

type Options = {
  initial: boolean;
  initialCount: number;
  onToggle: (next: boolean) => Promise<LikeState>;
};

export function useOptimisticLike({ initial, initialCount, onToggle }: Options) {
  const [liked, setLiked] = useState(initial);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const result = await onToggle(next);
      setLiked(result.likedByMe);
      setCount(result.likeCount);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return { liked, count, pending, toggle } as const;
}
