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

/** Creation d'un post (maquette : pas de persistance). */
export async function createPost(input: { text: string }): Promise<void> {
  // TODO(api): await apiFetch("/posts", { method: "POST", body: JSON.stringify(input) });
  console.log("createPost (mock)", input);
}
