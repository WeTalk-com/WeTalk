import type { TrendingTopic } from "@/lib/types";
import { trending } from "@/lib/mock-data";

/** Sujets tendance. */
export async function getTrending(): Promise<TrendingTopic[]> {
  // TODO(api): return apiFetch<TrendingTopic[]>("/trending");
  return structuredClone(trending);
}
