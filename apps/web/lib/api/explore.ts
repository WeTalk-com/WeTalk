import type { TrendingTopic } from "@/lib/types";
import { apiFetch } from "./client";

/** Tags tendance */
export async function getTrending(limit: number): Promise<TrendingTopic[]> {
  const data = await apiFetch<{ tags: TrendingTopic[] }>(
    `/tags/trending?limit=${limit}`,
  );
  return data.tags;
}

/** Top 10 tags tendance */
export function getTrendingExplore(): Promise<TrendingTopic[]> {
  return getTrending(10);
}

/** Top 5 tags tendance */
export function getTrendingHome(): Promise<TrendingTopic[]> {
  return getTrending(5);
}
