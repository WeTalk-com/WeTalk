/**
 * Traduction des formes backend -> modeles de domaine front (lib/types).
 */
import type { Post, User, Profile, Comment, Reply } from "@/lib/types";

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
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isBanned?: boolean;
  isSuspended?: boolean;
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
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  media?: BackendMedia | null;
  tags?: string[]
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
    isBanned: u.isBanned,
    isSuspended: u.isSuspended,
  };
}

export function mapPost(p: BackendPost): Post {
  const author: User = p.author
    ? mapUser(p.author)
    : { id: p.authorId, name: "?", handle: "unknown", initial: "?" };
  // Garantit que createdAt est en UTC — MongoDB peut omettre le suffixe Z.
  const createdAt = p.createdAt.endsWith("Z") ? p.createdAt : `${p.createdAt}Z`;
  const media = p.media ?? null;
  return {
    id: p._id,
    author,
    createdAt,
    text: p.content ?? "",
    tags: (p.tags ?? []).map((t) => `#${t}`),
    likes: p.likeCount,
    likedByMe: p.likedByMe,
    comments: p.commentCount,
    hasImage: media?.type === "image" || undefined,
    imageUrl: media?.type === "image" ? media.url : undefined,
    hasVideo: media?.type === "video" || undefined,
    videoUrl: media?.type === "video" ? media.url : undefined,
  };
}

// Commentaire enrichi renvoye par post-service (liste plate, parentId = reponse).
export type BackendComment = {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author: BackendUser | null;
  likeCount: number;
  likedByMe: boolean;
};

function mapAuthor(c: BackendComment): User {
  return c.author
    ? mapUser(c.author)
    : { id: c.authorId, name: "?", handle: "unknown", initial: "?" };
}

/** Une reponse (commentaire avec parentId). */
export function mapReply(c: BackendComment): Reply {
  return {
    id: c._id,
    author: mapAuthor(c),
    text: c.content,
    createdAt: c.createdAt,
    likes: c.likeCount,
    likedByMe: c.likedByMe,
  };
}

/**
 * Reconstruit l'arbre commentaires/reponses (1 niveau) a partir de la liste plate.
 * Racines = parentId null ; les autres sont rattachees a leur parent.
 */
export function mapCommentTree(rows: BackendComment[]): Comment[] {
  const repliesByParent = new Map<string, Reply[]>();
  for (const c of rows) {
    if (c.parentId) {
      const arr = repliesByParent.get(c.parentId) ?? [];
      arr.push(mapReply(c));
      repliesByParent.set(c.parentId, arr);
    }
  }
  // Le back trie en _id decroissant ; on remet les reponses en ordre chronologique.
  return rows
    .filter((c) => !c.parentId)
    .map((c) => ({
      id: c._id,
      author: mapAuthor(c),
      text: c.content,
      createdAt: c.createdAt,
      likes: c.likeCount,
      likedByMe: c.likedByMe,
      replies: (repliesByParent.get(c._id) ?? []).reverse(),
    }));
}

export function mapProfile(u: BackendUser): Profile {
  return {
    ...mapUser(u),
    bio: u.description ?? "",
    location: "",
    bannerUrl: u.profileBanner ?? undefined,
    joined: u.createdAt ? new Date(u.createdAt).getFullYear().toString() : "",
    stats: {
      posts: u.postsCount ?? 0,
      followers: String(u.followersCount ?? 0),
      following: u.followingCount ?? 0,
    },
  };
}
