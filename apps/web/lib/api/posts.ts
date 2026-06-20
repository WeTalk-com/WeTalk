import type { Post, Comment, Reply, ReportReason } from "@/lib/types";
import { myPosts } from "@/lib/mock-data";
import { apiFetch } from "./client";
import { getCurrentUser } from "./users";
import { mapPost, mapCommentTree, type BackendPost, type BackendComment } from "./map";

// Reponse brute de creation d'un commentaire (pas encore enrichi auteur/likes).
type CreatedComment = { _id: string; content: string; createdAt: string };

/** Fil principal — posts récents réels (post-service). */
export async function getPosts(): Promise<Post[]> {
  const data = await apiFetch<{ posts: BackendPost[] }>("/posts");
  return data.posts.map(mapPost);
}

/** Publications de l'utilisateur courant (page profil). */
export async function getMyPosts(): Promise<Post[]> {
  // TODO(api): return apiFetch<Post[]>("/me/posts");
  return structuredClone(myPosts);
}

export type CreatePostInput = {
  text: string;
  /** Hashtags extraits du texte (ex: ["#wetalk", "#photo"]) */
  tags: string[];
  /** Fichier image sélectionné par l'utilisateur */
  image?: File;
  /** Fichier vidéo sélectionné par l'utilisateur */
  video?: File;
};

/** Création d'un post. Le backend ne gère que le texte (tags/médias = feature à venir). */
export async function createPost(input: CreatePostInput): Promise<void> {
  // TODO(feature médias): image/vidéo en multipart/form-data quand le media-service existera.
  await apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify({ content: input.text }),
  });
}

export type LikeState = { likeCount: number; likedByMe: boolean };

/** Like un post (idempotent côté back). */
export function likePost(postId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/posts/${postId}/like`, { method: "POST" });
}

/** Retire son like (idempotent côté back). */
export function unlikePost(postId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/posts/${postId}/like`, { method: "DELETE" });
}

/** Commentaires d'un post (liste plate -> arbre 1 niveau). */
export async function getComments(postId: string): Promise<Comment[]> {
  const data = await apiFetch<{ comments: BackendComment[] }>(`/posts/${postId}/comments`);
  return mapCommentTree(data.comments);
}

/** Ajoute un commentaire racine ; l'auteur est le lecteur courant. */
export async function createComment(postId: string, text: string): Promise<Comment> {
  const { comment } = await apiFetch<{ comment: CreatedComment }>(
    `/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ content: text }) },
  );
  const me = await getCurrentUser();
  return {
    id: comment._id,
    author: me,
    text: comment.content,
    createdAt: comment.createdAt,
    likes: 0,
    likedByMe: false,
    replies: [],
  };
}

/** Ajoute une réponse : commentaire avec parentId (le back traite les réponses comme des commentaires). */
export async function createReply(
  postId: string,
  commentId: string,
  text: string,
): Promise<Reply> {
  const { comment } = await apiFetch<{ comment: CreatedComment }>(
    `/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ content: text, parentId: commentId }) },
  );
  const me = await getCurrentUser();
  return {
    id: comment._id,
    author: me,
    text: comment.content,
    createdAt: comment.createdAt,
    likes: 0,
    likedByMe: false,
  };
}

/** Like / unlike un commentaire (idempotent côté back). */
export function likeComment(commentId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/comments/${commentId}/like`, { method: "POST" });
}

export function unlikeComment(commentId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/comments/${commentId}/like`, { method: "DELETE" });
}

/** Signale un post. */
export async function reportPost(
  postId: string,
  reason: ReportReason,
  details?: string,
): Promise<void> {
  // TODO(api): await apiFetch(`/posts/${postId}/report`, { method: "POST", body: JSON.stringify({ reason, details }) });
  if (process.env.NODE_ENV === "development") {
    console.log("reportPost (mock)", { postId, reason, details });
  }
}
