import type { Post, Comment, Reply, ReportReason } from "@/lib/types";
import { posts, myPosts, postComments, currentUser } from "@/lib/mock-data";

/** Fil principal. */
export async function getPosts(): Promise<Post[]> {
  // TODO(api): return apiFetch<Post[]>("/posts");
  return structuredClone(posts);
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

/** Creation d'un post (maquette : pas de persistance). */
export async function createPost(input: CreatePostInput): Promise<void> {
  // TODO(api): multipart/form-data si media présent, sinon JSON
  // const fd = new FormData();
  // fd.append("text", input.text); fd.append("tags", JSON.stringify(input.tags));
  // if (input.image) fd.append("image", input.image);
  // if (input.video) fd.append("video", input.video);
  // await apiFetch("/posts", { method: "POST", body: input.image || input.video ? fd : JSON.stringify({ text: input.text, tags: input.tags }) });
  if (process.env.NODE_ENV === "development") {
    console.log("createPost (mock)", input);
  }
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
