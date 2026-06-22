import type { Post, Comment, Reply, ReportReason } from "@/lib/types";
import { postComments, currentUser } from "@/lib/mock-data";
import { apiFetch } from "./client";
import { mapPost, type BackendPost } from "./map";

/** Fil global — tous les posts récents (page Explore). */
export async function getPosts(): Promise<Post[]> {
  const data = await apiFetch<{ posts: BackendPost[] }>("/posts");
  return data.posts.map(mapPost);
}

/** Fil d'accueil (Fx5) — posts de l'utilisateur courant + des comptes qu'il suit. */
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

/**
 * Création d'un post (texte + image/video)
 */
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

/** Commentaires d'un post. */
export async function getComments(postId: string): Promise<Comment[]> {
  // TODO(api): return apiFetch<Comment[]>(`/posts/${postId}/comments`);
  return structuredClone(postComments[postId] ?? []);
}

/** Ajoute un commentaire (optimiste côté client). */
export async function createComment(postId: string, text: string): Promise<Comment> {
  // TODO(api): return apiFetch<Comment>(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ text }) });
  if (process.env.NODE_ENV === "development") {
    console.log("createComment (mock)", { postId, text });
  }
  return {
    id: `cm-${Date.now()}`,
    author: structuredClone(currentUser),
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: [],
  };
}

/** Ajoute une réponse à un commentaire. */
export async function createReply(commentId: string, text: string): Promise<Reply> {
  // TODO(api): return apiFetch<Reply>(`/comments/${commentId}/replies`, { method: "POST", body: JSON.stringify({ text }) });
  if (process.env.NODE_ENV === "development") {
    console.log("createReply (mock)", { commentId, text });
  }
  return {
    id: `rp-${Date.now()}`,
    author: structuredClone(currentUser),
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
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
