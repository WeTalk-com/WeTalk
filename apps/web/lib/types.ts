/**
 * Modeles de domaine de l'application.
 * Volontairement proches d'une future reponse d'API pour faciliter le
 * branchement back-end (les donnees factices vivent dans mock-data.ts).
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

export type Profile = User & {
  bio: string;
  location: string;
  joined: string;
  stats: { posts: number; followers: string; following: number };
};

export type ExploreTile = {
  id: string;
  tag: string;
  /** hauteur du placeholder (effet masonry) */
  height: number;
  likes: string;
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
  timeAgo: string;
  read?: boolean;
};
