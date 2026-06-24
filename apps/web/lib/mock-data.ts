/**
 * Données factices pour les fonctionnalités non encore câblées au back-end.
 * Seuls les exports effectivement consommés par lib/api/* sont conservés ici.
 * Les types de domaine vivent dans ./types.
 */

import type { TrendingTopic } from "./types";

/* ----------------------------- Tendances ----------------------------- */

export const trending: TrendingTopic[] = [
  { category: "Photography", tag: "#goldenhour", posts: "48.2K posts" },
  { category: "Trending", tag: "#wetalk", posts: "31.9K posts" },
  { category: "Design", tag: "#warmtones", posts: "12.4K posts" },
  { category: "Travel", tag: "#slowmornings", posts: "9.1K posts" },
];
