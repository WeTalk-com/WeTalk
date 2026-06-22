/**
 * Traduction des formes backend -> modeles de domaine front (lib/types).
 * Le back ne fournit pas tags/likes/medias : valeurs neutres en attendant P2.
 */
import type { Post, User, Profile } from "@/lib/types";

// publicUser renvoye par user-service.
export type BackendUser = {
  id: string;
  username: string;
  displayName: string | null;
  description?: string | null;
  profileImage: string | null;
  profileBanner?: string | null;
  role?: "user" | "moderator" | "admin";
  createdAt?: string;
};

// media attaché à un post
export type BackendMedia = {
  url: string;
  type: "image" | "video";
};

// Post enrichi renvoye par post-service.
export type BackendPost = {
  _id: string;
  authorId: string;
  content: string | null;
  createdAt: string;
  authorBanned?: boolean;
  author: BackendUser | null;
  media?: BackendMedia | null;
};

export function mapUser(u: BackendUser): User {
  const name = u.displayName?.trim() || u.username;
  return {
    id: u.id,
    name,
    handle: u.username,
    initial: name.charAt(0).toUpperCase(),
    avatarUrl: u.profileImage ?? undefined,
    role: u.role,
  };
}

export function mapPost(p: BackendPost): Post {
  const author: User = p.author
    ? mapUser(p.author)
    : { id: p.authorId, name: "?", handle: "unknown", initial: "?" };
  const media = p.media ?? null;
  return {
    id: p._id,
    author,
    createdAt: p.createdAt,
    text: p.content ?? "",
    tags: [],
    hasImage: media?.type === "image" || undefined,
    imageUrl: media?.type === "image" ? media.url : undefined,
    hasVideo: media?.type === "video" || undefined,
    videoUrl: media?.type === "video" ? media.url : undefined,
    likes: 0,
    comments: 0,
    shares: 0,
  };
}

export function mapProfile(u: BackendUser): Profile {
  return {
    ...mapUser(u),
    bio: u.description ?? "",
    location: "",
    bannerUrl: u.profileBanner ?? undefined,
    joined: u.createdAt ? new Date(u.createdAt).getFullYear().toString() : "",
    stats: { posts: 0, followers: "0", following: 0 },
  };
}
