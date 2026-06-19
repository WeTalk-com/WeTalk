/**
 * Donnees factices pour la v1 design-only.
 * Les types de domaine vivent dans ./types (reutilisables apres branchement API).
 */

import type {
  User,
  Post,
  TrendingTopic,
  Profile,
  Notification,
  Conversation,
  Comment,
  ReportedPost,
} from "./types";

export const currentUser: User = {
  id: "me",
  name: "Katty Abrahams",
  handle: "kattyabra",
  initial: "K",
  role: "admin",
};

export const posts: Post[] = [
  {
    id: "p1",
    author: {
      id: "u1",
      name: "Maya Rivera",
      handle: "mayarivera",
      initial: "M",
      verified: true,
    },
    timeAgo: "2h",
    text: "Chasing the golden hour across the dunes — slow mornings really do hit different.",
    tags: ["#wetalk", "#goldenhour"],
    hasImage: true,
    imageRatio: "1600x1000",
    likes: 1245,
    comments: 173,
    shares: 229,
  },
  {
    id: "p2",
    author: {
      id: "u2",
      name: "Theo Lang",
      handle: "theolang",
      initial: "T",
      verified: true,
    },
    timeAgo: "5h",
    text: "Studio light tests for the new series. Warm tones only, always.",
    tags: ["#wetalk", "#process"],
    hasImage: true,
    imageRatio: "1600x1000",
    likes: 842,
    comments: 96,
    shares: 51,
  },
  {
    id: "p3",
    author: { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" },
    timeAgo: "8h",
    text: "Anyone else editing at 2am because the colors finally clicked?",
    tags: ["#latenight", "#design"],
    likes: 318,
    comments: 44,
    shares: 12,
  },
  {
    id: "p4",
    author: { id: "u4", name: "Lara Moons", handle: "laramoons", initial: "L" },
    timeAgo: "1d",
    text: "Behind-the-scenes from yesterday's shoot — short reel dropping tonight 🎬",
    tags: ["#film", "#bts"],
    hasVideo: true,
    likes: 567,
    comments: 89,
    shares: 34,
  },
];

export const whoToFollow: User[] = [
  { id: "w1", name: "Jonas Beck", handle: "jonasbeck", initial: "J" },
  { id: "w2", name: "Elif Demir", handle: "elifd", initial: "E" },
  { id: "w3", name: "Remy Cole", handle: "remycole", initial: "R" },
];

export const trending: TrendingTopic[] = [
  { category: "Photography", tag: "#goldenhour", posts: "48.2K posts" },
  { category: "Trending", tag: "#wetalk", posts: "31.9K posts" },
  { category: "Design", tag: "#warmtones", posts: "12.4K posts" },
  { category: "Travel", tag: "#slowmornings", posts: "9.1K posts" },
];

/* ----------------------------- Profil ----------------------------- */

export const currentUserProfile: Profile = {
  ...currentUser,
  verified: true,
  bio: "Slow mornings, warm light & the occasional film photo. Building cozy corners of the internet.",
  location: "Lisbon, PT",
  joined: "Joined March 2024",
  stats: { posts: 128, followers: "4.8K", following: 312 },
};

/** Publications de l'utilisateur courant (page profil). */
export const myPosts: Post[] = [
  {
    id: "me1",
    author: currentUser,
    timeAgo: "1d",
    text: "Reorganised my desk for the third time this week. Productivity is a myth, vibes are real.",
    tags: ["#slowmornings", "#wetalk"],
    hasImage: true,
    imageRatio: "1600x1000",
    likes: 421,
    comments: 38,
    shares: 9,
  },
  {
    id: "me2",
    author: currentUser,
    timeAgo: "3d",
    text: "Tiny film roll, big feelings. Shot the whole street in golden light.",
    tags: ["#goldenhour", "#film"],
    likes: 196,
    comments: 21,
    shares: 4,
  },
];

/* -------------------------- Comments -------------------------- */

const _u1: User = { id: "u1", name: "Maya Rivera", handle: "mayarivera", initial: "M", verified: true };
const _u2: User = { id: "u2", name: "Theo Lang", handle: "theolang", initial: "T", verified: true };
const _u3: User = { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" };
const _u4: User = { id: "u4", name: "Lara Moons", handle: "laramoons", initial: "L" };

export const postComments: Record<string, Comment[]> = {
  p1: [
    {
      id: "cm1",
      author: _u2,
      text: "This golden hour lighting is unreal! What time did you shoot this?",
      timeAgo: "1h",
      likes: 24,
      replies: [
        {
          id: "rp1",
          author: _u1,
          text: "Around 7pm! The dunes catch the light perfectly at that hour.",
          timeAgo: "55m",
          likes: 8,
        },
      ],
    },
    {
      id: "cm2",
      author: _u3,
      text: "Golden hours and slow mornings — my whole aesthetic 🌅",
      timeAgo: "45m",
      likes: 12,
      replies: [],
    },
  ],
  p2: [
    {
      id: "cm3",
      author: _u3,
      text: "Those warm studio tones are everything. Presets available? 🙏",
      timeAgo: "3h",
      likes: 41,
      replies: [
        {
          id: "rp2",
          author: _u2,
          text: "Dropping them next week on the newsletter! Stay tuned 🎞️",
          timeAgo: "2h",
          likes: 18,
        },
      ],
    },
  ],
  p3: [],
  p4: [
    {
      id: "cm4",
      author: _u1,
      text: "Can't wait for this reel 🔥 your BTS content is always chef's kiss",
      timeAgo: "20h",
      likes: 57,
      replies: [
        {
          id: "rp3",
          author: _u4,
          text: "Thank you! Dropping midnight tonight 🌙",
          timeAgo: "19h",
          likes: 21,
        },
      ],
    },
  ],
};

/* --------------------------- Signalements -------------------------- */

export const reportedPosts: ReportedPost[] = [
  {
    id: "rep1",
    post: {
      id: "px1",
      author: { id: "ux1", name: "Bad Actor", handle: "badactor", initial: "B" },
      timeAgo: "3h",
      text: "Buy followers now! Best prices guaranteed ✨✨✨",
      tags: [],
      likes: 2,
      comments: 0,
      shares: 0,
    },
    reason: "spam",
    reportedBy: { id: "w3", name: "Remy Cole", handle: "remycole", initial: "R" },
    reportedAt: "2h",
    status: "pending",
  },
  {
    id: "rep2",
    post: {
      id: "px2",
      author: { id: "ux2", name: "TrollUser99", handle: "trolluser99", initial: "T" },
      timeAgo: "6h",
      text: "This is completely false information about a public health topic.",
      tags: [],
      likes: 14,
      comments: 3,
      shares: 7,
    },
    reason: "misinformation",
    reportedBy: { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" },
    reportedAt: "5h",
    status: "pending",
  },
];

/* ---------------------------- Messages ---------------------------- */

export const conversations: Conversation[] = [
  {
    id: "c1",
    user: { id: "u1", name: "Maya Rivera", handle: "mayarivera", initial: "M", verified: true },
    lastMessage: "tes photos sont incroyables !",
    timeAgo: "12m",
    unread: 2,
    messages: [
      { id: "m1", text: "Hey ! J'ai vu ton dernier post, vraiment magnifique.", timeAgo: "1h", mine: false },
      { id: "m2", text: "Merci beaucoup ! C'était un beau coucher de soleil.", timeAgo: "55m", mine: true },
      { id: "m3", text: "tes photos sont incroyables !", timeAgo: "12m", mine: false },
    ],
  },
  {
    id: "c2",
    user: { id: "u2", name: "Theo Lang", handle: "theolang", initial: "T", verified: true },
    lastMessage: "Oui bien sûr, on se retrouve vendredi ?",
    timeAgo: "2h",
    messages: [
      { id: "m4", text: "Salut ! Tu veux qu'on tourne quelque chose ensemble cette semaine ?", timeAgo: "3h", mine: false },
      { id: "m5", text: "Oui bien sûr, on se retrouve vendredi ?", timeAgo: "2h", mine: true },
    ],
  },
  {
    id: "c3",
    user: { id: "u3", name: "Nina Vale", handle: "ninavale", initial: "N" },
    lastMessage: "J'adore cette palette de couleurs 🎨",
    timeAgo: "1d",
    messages: [
      { id: "m6", text: "J'adore cette palette de couleurs 🎨", timeAgo: "1d", mine: false },
    ],
  },
  {
    id: "c4",
    user: { id: "w1", name: "Jonas Beck", handle: "jonasbeck", initial: "J" },
    lastMessage: "Merci pour le follow !",
    timeAgo: "2d",
    messages: [
      { id: "m7", text: "Merci pour le follow !", timeAgo: "2d", mine: false },
      { id: "m8", text: "Avec plaisir, ton feed est superbe.", timeAgo: "2d", mine: true },
    ],
  },
];

/* -------------------------- Notifications -------------------------- */

const u = (
  id: string,
  name: string,
  handle: string,
  initial: string,
  verified = false,
): User => ({ id, name, handle, initial, verified });

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    actor: u("u1", "Maya Rivera", "mayarivera", "M", true),
    text: "liked your post",
    preview: "Golden hour never misses ☀️ #wetalk",
    timeAgo: "12m",
  },
  {
    id: "n2",
    type: "follow",
    actor: u("w1", "Jonas Beck", "jonasbeck", "J"),
    text: "started following you",
    timeAgo: "40m",
  },
  {
    id: "n3",
    type: "mention",
    actor: u("u3", "Nina Vale", "ninavale", "N"),
    text: "mentioned you in a post",
    preview: "shooting the rooftop with @kattyabra tonight 🎞️",
    timeAgo: "2h",
  },
  {
    id: "n4",
    type: "comment",
    actor: u("u2", "Theo Lang", "theolang", "T", true),
    text: "commented on your post",
    preview: "this palette is unreal, presets when??",
    timeAgo: "5h",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    actor: u("w2", "Elif Demir", "elifd", "E"),
    text: "liked your post",
    preview: "Slow mornings, warm light.",
    timeAgo: "1d",
    read: true,
  },
  {
    id: "n6",
    type: "follow",
    actor: u("w3", "Remy Cole", "remycole", "R"),
    text: "started following you",
    timeAgo: "2d",
    read: true,
  },
];
