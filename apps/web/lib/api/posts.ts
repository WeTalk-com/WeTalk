import type { Post } from "@/lib/types";
import { posts, myPosts } from "@/lib/mock-data";

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
};

/** Creation d'un post (maquette : pas de persistance). */
export async function createPost(input: CreatePostInput): Promise<void> {
  // TODO(api): si image présente → multipart/form-data, sinon → JSON
  // const body = input.image
  //   ? (() => { const fd = new FormData(); fd.append("text", input.text); fd.append("tags", JSON.stringify(input.tags)); fd.append("image", input.image!); return fd; })()
  //   : JSON.stringify({ text: input.text, tags: input.tags });
  // await apiFetch("/posts", { method: "POST", body });
  if (process.env.NODE_ENV === "development") {
    console.log("createPost (mock)", input);
  }
}
