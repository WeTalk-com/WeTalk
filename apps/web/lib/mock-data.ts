/**
 * Données factices pour les fonctionnalités non encore câblées au back-end.
 * Seuls les exports effectivement consommés par lib/api/* sont conservés ici.
 * Les types de domaine vivent dans ./types.
 */

import type {
  Post,
  TrendingTopic,
  Conversation,
  ReportedPost,
} from "./types";

function ago(value: number, unit: "m" | "h" | "d"): string {
  const ms = { m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return new Date(Date.now() - value * ms).toISOString();
}

/* ----------------------------- Tendances ----------------------------- */

export const trending: TrendingTopic[] = [
  { category: "Photography", tag: "#goldenhour", posts: "48.2K posts" },
  { category: "Trending", tag: "#wetalk", posts: "31.9K posts" },
  { category: "Design", tag: "#warmtones", posts: "12.4K posts" },
  { category: "Travel", tag: "#slowmornings", posts: "9.1K posts" },
];

/* ----------------------------- Signalements ----------------------------- */

const _badPost = (id: string, text: string): Post => ({
  id,
  author: { id: `a-${id}`, name: "Bad Actor", handle: "badactor", initial: "B" },
  createdAt: ago(3, "h"),
  text,
  tags: [],
  likes: 0,
  comments: 0,
});

export const reportedPosts: ReportedPost[] = [
  {
    id: "rep1",
    post: _badPost("px1", "Buy followers now! Best prices guaranteed ✨✨✨"),
    reason: "spam",
    reportedBy: { id: "w3", name: "Remy Cole", handle: "remycole", initial: "R" },
    reportedAt: ago(2, "h"),
    status: "pending",
  },
  {
    id: "rep2",
    post: {
      id: "px2",
      author: { id: "ux2", name: "TrollUser99", handle: "trolluser99", initial: "T" },
      createdAt: ago(6, "h"),
      text: "This is completely false information about a public health topic.",
      tags: [],
      likes: 14,
      comments: 3,
    },
    reason: "misinformation",
    reportedBy: { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" },
    reportedAt: ago(5, "h"),
    status: "pending",
  },
];

/* ----------------------------- Messages ----------------------------- */

export const conversations: Conversation[] = [
  {
    id: "c1",
    user: { id: "u1", name: "Maya Rivera", handle: "mayarivera", initial: "M", verified: true },
    lastMessage: "tes photos sont incroyables !",
    lastMessageAt: ago(12, "m"),
    unread: 2,
    messages: [
      { id: "m1", text: "Hey ! J'ai vu ton dernier post, vraiment magnifique.", createdAt: ago(1, "h"), mine: false },
      { id: "m2", text: "Merci beaucoup ! C'était un beau coucher de soleil.", createdAt: ago(55, "m"), mine: true },
      { id: "m3", text: "tes photos sont incroyables !", createdAt: ago(12, "m"), mine: false },
    ],
  },
  {
    id: "c2",
    user: { id: "u2", name: "Theo Lang", handle: "theolang", initial: "T", verified: true },
    lastMessage: "Oui bien sûr, on se retrouve vendredi ?",
    lastMessageAt: ago(2, "h"),
    messages: [
      { id: "m4", text: "Salut ! Tu veux qu'on tourne quelque chose ensemble cette semaine ?", createdAt: ago(3, "h"), mine: false },
      { id: "m5", text: "Oui bien sûr, on se retrouve vendredi ?", createdAt: ago(2, "h"), mine: true },
    ],
  },
  {
    id: "c3",
    user: { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" },
    lastMessage: "J'adore cette palette de couleurs 🎨",
    lastMessageAt: ago(1, "d"),
    messages: [
      { id: "m6", text: "J'adore cette palette de couleurs 🎨", createdAt: ago(1, "d"), mine: false },
    ],
  },
  {
    id: "c4",
    user: { id: "w1", name: "Jonas Beck", handle: "jonasbeck", initial: "J" },
    lastMessage: "Merci pour le follow !",
    lastMessageAt: ago(2, "d"),
    messages: [
      { id: "m7", text: "Merci pour le follow !", createdAt: ago(2, "d"), mine: false },
      { id: "m8", text: "Avec plaisir, ton feed est superbe.", createdAt: ago(2, "d"), mine: true },
    ],
  },
];

/* ----------------------------- Notifications ----------------------------- */

