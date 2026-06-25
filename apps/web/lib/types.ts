/**
 * Modeles de domaine de l'application.
 * Volontairement proches d'une future reponse d'API pour faciliter le
 * branchement back-end (les donnees factices vivent dans mock-data.ts).
 */

export type User = {
  id: string;
  name: string;
  handle: string;
  /** Initiale affichee dans l'avatar (fallback si pas de photo) */
  initial: string;
  avatarUrl?: string;
  verified?: boolean;
  role?: "user" | "moderator" | "admin";
  isBanned?: boolean;
  isSuspended?: boolean;
};

export type Post = {
  id: string;
  author: User;
  /** Date de creation au format ISO 8601 (formatee a l'affichage). */
  createdAt: string;
  text: string;
  /** tags affiches en couleur or dans le texte */
  tags: string[];
  hasImage?: boolean;
  imageRatio?: string; // ex. "1600x1000"
  imageUrl?: string;
  hasVideo?: boolean;
  videoUrl?: string;
  likes: number;
  /** Le lecteur courant a-t-il liké ce post (état initial du bouton). */
  likedByMe?: boolean;
  comments: number;
};

export type Reply = {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
};

export type Comment = {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  replies: Reply[];
};

export type TrendingTopic = {
  category: string;
  tag: string;
  posts: string; // "48.2K posts"
};

export type Profile = User & {
  bio: string;
  location: string;
  bannerUrl?: string;
  joined: string;
  stats: { posts: number; followers: string; following: number };
};


export type NotificationType = "like" | "comment" | "follow" | "mention";

export type Notification = {
  id: string;
  type: NotificationType;
  actor: User;
  /** action ("liked your post", "started following you"...) */
  text: string;
  /** extrait optionnel (contenu du commentaire / mention / post) */
  preview?: string;
  createdAt: string;
  read?: boolean;
  postId?: string;
  commentId?: string;
};

export type Message = {
  id: string;
  text: string;
  createdAt: string;
  mine: boolean;
};

export type Conversation = {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageAt: string;
  unread?: number;
  messages: Message[];
};

export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "misinformation"
  | "other";

export type ReportedPost = {
  id: string;
  reason: ReportReason;
  details?: string | null;
  status: "pending" | "resolved" | "dismissed";
  reportedAt: string;
  reporter: User | null;
  post: {
    id: string;
    text: string;
    author: User | null;
  } | null;
};
