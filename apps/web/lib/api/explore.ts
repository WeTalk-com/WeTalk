import type { TrendingTopic } from "@/lib/types";
import { apiFetch } from "./client";

/** Sujets tendance. */
export async function getTrending(): Promise<TrendingTopic[]> {
  const data = await apiFetch<{ tags: TrendingTopic[] }>("/tags/trending");
  return data.tags;
}
