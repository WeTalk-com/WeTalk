import type { User, Profile } from "@/lib/types";
import { whoToFollow } from "@/lib/mock-data";
import { apiFetch } from "./client";
import { mapUser, mapProfile, type BackendUser } from "./map";

/** Utilisateur connecté (depuis le cookie de session). */
export async function getCurrentUser(): Promise<User> {
  return mapUser(await apiFetch<BackendUser>("/users/me"));
}

/** Profil affiché — ici le profil de l'utilisateur courant. */
export async function getProfile(): Promise<Profile> {
  return mapProfile(await apiFetch<BackendUser>("/users/me"));
}

/** Profil public d'un utilisateur par handle (username) ou id. */
export async function getUserProfile(handle: string): Promise<Profile> {
  return mapProfile(await apiFetch<BackendUser>(`/users/${encodeURIComponent(handle)}`));
}

/** IDs des utilisateurs suivis par `userId` (pour l'état initial du bouton Suivre). */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const data = await apiFetch<{ ids: string[] }>(
    `/users/${encodeURIComponent(userId)}/following/ids`,
  );
  return data.ids;
}

export type UpdateProfileInput = {
  displayName?: string;
  description?: string;
  avatar?: File;
  banner?: File;
};

/**
 * Met à jour le profil courant
 */
export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const form = new FormData();
  if (input.displayName !== undefined) form.append("displayName", input.displayName);
  if (input.description !== undefined) form.append("description", input.description);
  if (input.avatar) form.append("avatar", input.avatar);
  if (input.banner) form.append("banner", input.banner);
  await apiFetch("/users/me", { method: "PATCH", body: form });
}

/** S'abonner à un utilisateur. */
export function followUser(id: string): Promise<unknown> {
  return apiFetch(`/users/${id}/follow`, { method: "POST" });
}

/** Se désabonner. */
export function unfollowUser(id: string): Promise<unknown> {
  return apiFetch(`/users/${id}/follow`, { method: "DELETE" });
}

/** Suggestions "à suivre" — pas d'endpoint backend, reste mock. */
export async function getWhoToFollow(): Promise<User[]> {
  return structuredClone(whoToFollow);
}
