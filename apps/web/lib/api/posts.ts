import type { Post, Comment, Reply, ReportReason, User } from "@/lib/types";
import { apiFetch } from "./client";
import { mapPost, mapCommentTree, type BackendPost, type BackendComment } from "./map";

// Reponse brute de creation d'un commentaire (pas encore enrichi auteur/likes).
type CreatedComment = { _id: string; content: string; createdAt: string };

/** Fil global — tous les posts récents (page Explore). */
export async function getPosts(): Promise<Post[]> {
  const data = await apiFetch<{ posts: BackendPost[] }>("/posts");
  return data.posts.map(mapPost);
}

/** Fil d'accueil — posts de l'utilisateur courant + des comptes qu'il suit. */
export async function getFeed(): Promise<Post[]> {
  const data = await apiFetch<{ posts: BackendPost[] }>("/posts/feed");
  return data.posts.map(mapPost);
}

/** Publications d'un auteur (page profil — soi-même ou autrui). */
export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const data = await apiFetch<{ posts: BackendPost[] }>(
    `/posts?authorId=${encodeURIComponent(authorId)}`,
  );
  return data.posts.map(mapPost);
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

/** Création d'un post (texte + image/video). */
export async function createPost(input: CreatePostInput): Promise<void> {
  const file = input.image ?? input.video;
  if (file) {
    const form = new FormData();
    form.append("content", input.text);
    form.append("media", file);
    await apiFetch("/posts", { method: "POST", body: form });
    return;
  }
  await apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify({ content: input.text }),
  });
}

/** Récupère un post par son identifiant. */
export async function getPost(id: string): Promise<Post> {
  const data = await apiFetch<{ post: BackendPost }>(`/posts/${encodeURIComponent(id)}`);
  return mapPost(data.post);
}

export type LikeState = { likeCount: number; likedByMe: boolean };

/** Like un post (idempotent côté back). */
export function likePost(postId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/posts/${encodeURIComponent(postId)}/like`, { method: "POST" });
}

/** Retire son like (idempotent côté back). */
export function unlikePost(postId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/posts/${encodeURIComponent(postId)}/like`, { method: "DELETE" });
}

/** Commentaires d'un post (liste plate → arbre 1 niveau). */
export async function getComments(postId: string): Promise<Comment[]> {
  const data = await apiFetch<{ comments: BackendComment[] }>(`/posts/${postId}/comments`);
  return mapCommentTree(data.comments);
}

/** Ajoute un commentaire racine ; `author` = lecteur courant (déjà en mémoire). */
export async function createComment(
  postId: string,
  text: string,
  author: User,
): Promise<Comment> {
  const { comment } = await apiFetch<{ comment: CreatedComment }>(
    `/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ content: text }) },
  );
  return {
    id: comment._id,
    author,
    text: comment.content,
    createdAt: comment.createdAt,
    likes: 0,
    likedByMe: false,
    replies: [],
  };
}

/** Ajoute une réponse (commentaire avec parentId). */
export async function createReply(
  postId: string,
  commentId: string,
  text: string,
  author: User,
): Promise<Reply> {
  const { comment } = await apiFetch<{ comment: CreatedComment }>(
    `/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ content: text, parentId: commentId }) },
  );
  return {
    id: comment._id,
    author,
    text: comment.content,
    createdAt: comment.createdAt,
    likes: 0,
    likedByMe: false,
  };
}

/** Like / unlike un commentaire (idempotent côté back). */
export function likeComment(commentId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/comments/${encodeURIComponent(commentId)}/like`, { method: "POST" });
}

export function unlikeComment(commentId: string): Promise<LikeState> {
  return apiFetch<LikeState>(`/comments/${encodeURIComponent(commentId)}/like`, { method: "DELETE" });
}

/** Supprime un post (auteur uniquement, vérifié côté back). */
export function deletePost(postId: string): Promise<void> {
  return apiFetch(`/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
}

/** Supprime un commentaire (auteur uniquement, vérifié côté back). */
export function deleteComment(commentId: string): Promise<void> {
  return apiFetch(`/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
}

/** Modifie le texte d'un commentaire (auteur uniquement, vérifié côté back). */
export function updateComment(commentId: string, text: string): Promise<void> {
  return apiFetch(`/comments/${encodeURIComponent(commentId)}`, {
    method: "PATCH",
    body: JSON.stringify({ content: text }),
  });
}

/** Signale un post. */
export async function reportPost(
  _postId: string,
  _reason: ReportReason,
  _details?: string,
): Promise<void> {
  // TODO(api): await apiFetch(`/posts/${_postId}/report`, { method: "POST", body: JSON.stringify({ reason: _reason, details: _details }) });
}
