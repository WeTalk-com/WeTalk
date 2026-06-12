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
