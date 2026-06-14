/**
 * Donnees factices pour la v1 design-only.
 * Les types sont volontairement proches d'une future reponse d'API
 * pour faciliter le branchement back-end plus tard.
 */

export type User = {
  id: string;
  name: string;
  handle: string;
  /** Initiale affichee dans l'avatar (placeholder design) */
  initial: string;
  verified?: boolean;
};

export type Post = {
  id: string;
  author: User;
  /** "5h", "2j"... (relatif, pre-formate cote mock) */
  timeAgo: string;
  text: string;
  /** tags affiches en couleur or dans le texte */
  tags: string[];
  hasImage?: boolean;
  imageRatio?: string; // ex. "1600x1000"
  likes: number;
  comments: number;
  shares: number;
};

export type TrendingTopic = {
  category: string;
  tag: string;
  posts: string; // "48.2K posts"
};

export const currentUser: User = {
  id: "me",
  name: "Katty Abrahams",
  handle: "kattyabra",
  initial: "K",
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
    tags: ["#weetalk", "#goldenhour"],
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
    tags: ["#weetalk", "#process"],
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
];

export const whoToFollow: User[] = [
  { id: "w1", name: "Jonas Beck", handle: "jonasbeck", initial: "J" },
  { id: "w2", name: "Elif Demir", handle: "elifd", initial: "E" },
  { id: "w3", name: "Remy Cole", handle: "remycole", initial: "R" },
];

export const trending: TrendingTopic[] = [
  { category: "Photography", tag: "#goldenhour", posts: "48.2K posts" },
  { category: "Trending", tag: "#weetalk", posts: "31.9K posts" },
  { category: "Design", tag: "#warmtones", posts: "12.4K posts" },
  { category: "Travel", tag: "#slowmornings", posts: "9.1K posts" },
];

/* ----------------------------- Profil ----------------------------- */

export type Profile = User & {
  bio: string;
  location: string;
  joined: string;
  stats: { posts: number; followers: string; following: number };
};

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
    tags: ["#slowmornings", "#weetalk"],
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

/* ----------------------------- Explore ----------------------------- */

export const exploreCategories = [
  "All",
  "Photo",
  "Travel",
  "Design",
  "Film",
  "Food",
] as const;

export type ExploreTile = {
  id: string;
  tag: string;
  /** hauteur du placeholder (effet masonry) */
  height: number;
  likes: string;
};

export const exploreTiles: ExploreTile[] = [
  { id: "e1", tag: "#goldenhour", height: 280, likes: "12.4K" },
  { id: "e2", tag: "#warmtones", height: 200, likes: "3.1K" },
  { id: "e3", tag: "#slowmornings", height: 320, likes: "8.7K" },
  { id: "e4", tag: "#film", height: 240, likes: "5.2K" },
  { id: "e5", tag: "#desksetup", height: 200, likes: "1.9K" },
  { id: "e6", tag: "#travel", height: 300, likes: "9.6K" },
  { id: "e7", tag: "#coffee", height: 220, likes: "6.0K" },
  { id: "e8", tag: "#weetalk", height: 260, likes: "31.9K" },
  { id: "e9", tag: "#cozy", height: 200, likes: "2.4K" },
];

/* -------------------------- Notifications -------------------------- */

export type NotificationType = "like" | "comment" | "follow" | "mention";

export type Notification = {
  id: string;
  type: NotificationType;
  actor: User;
  /** action ("liked your post", "started following you"...) */
  text: string;
  /** extrait optionnel (contenu du commentaire / mention / post) */
  preview?: string;
  timeAgo: string;
  read?: boolean;
};

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
    preview: "Golden hour never misses ☀️ #weetalk",
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
