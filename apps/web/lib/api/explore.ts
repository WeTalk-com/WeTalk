import type { ExploreTile, TrendingTopic } from "@/lib/types";
import { exploreTiles, trending } from "@/lib/mock-data";

/** Tuiles de la grille Explore. */
export async function getExploreTiles(): Promise<ExploreTile[]> {
  // TODO(api): return apiFetch<ExploreTile[]>("/explore");
  return exploreTiles;
}

/** Sujets tendance (rail de droite). */
export async function getTrending(): Promise<TrendingTopic[]> {
  // TODO(api): return apiFetch<TrendingTopic[]>("/trending");
  return trending;
}
