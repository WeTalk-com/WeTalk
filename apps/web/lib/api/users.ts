import { cache } from "react";
import type { User, Profile } from "@/lib/types";
import { apiFetch } from "./client";
import { mapUser, mapProfile, type BackendUser } from "./map";

/** Utilisateur connecté (depuis le cookie de session). Dédupliqué par requête via cache(). */
export const getCurrentUser = cache(async (): Promise<User> => {
  return mapUser(await apiFetch<BackendUser>("/users/me"));
});

/** Profil affiché — ici le profil de l'utilisateur courant. */
export async function getProfile(): Promise<Profile> {
  return mapProfile(await apiFetch<BackendUser>("/users/me"));
}

/** Profil public d'un utilisateur par handle (username) ou id. */
export async function getUserProfile(handle: string, silent = false): Promise<Profile> {
  return mapProfile(await apiFetch<BackendUser>(`/users/${encodeURIComponent(handle)}`, { silent }));
}

/** IDs des utilisateurs suivis par `userId`. */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const data = await apiFetch<{ ids: string[] }>(
    `/users/${encodeURIComponent(userId)}/following/ids`,
  );
  return data.ids;
}

// Le backend retourne seulement { id, username } dans les listes de follow.
// mapUser gère les champs manquants (displayName → username, profileImage → undefined).
type FollowEntry = Pick<BackendUser, "id" | "username">;

/** Liste des abonnés d'un utilisateur. */
export async function getFollowers(userId: string): Promise<User[]> {
  const data = await apiFetch<{ data: FollowEntry[] }>(
    `/users/${encodeURIComponent(userId)}/followers?limit=100`,
  );
  return (data.data ?? []).map((u) => mapUser(u as BackendUser));
}

/** Liste des comptes suivis par un utilisateur. */
export async function getFollowingList(userId: string): Promise<User[]> {
  const data = await apiFetch<{ data: FollowEntry[] }>(
    `/users/${encodeURIComponent(userId)}/following?limit=100`,
  );
  return (data.data ?? []).map((u) => mapUser(u as BackendUser));
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

/** Supprime définitivement le compte courant (révoque les tokens côté back). */
export function deleteAccount(): Promise<void> {
  return apiFetch("/users/me", { method: "DELETE" });
}

/** S'abonner à un utilisateur. */
export function followUser(id: string): Promise<unknown> {
  return apiFetch(`/users/${encodeURIComponent(id)}/follow`, { method: "POST" });
}

/** Se désabonner. */
export function unfollowUser(id: string): Promise<unknown> {
  return apiFetch(`/users/${encodeURIComponent(id)}/follow`, { method: "DELETE" });
}

/** Suggestions "à suivre" ou résultats de recherche depuis le backend. */
export async function searchUsers(query?: string): Promise<User[]> {
  const qs = query?.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
  const data = await apiFetch<BackendUser[]>(`/users${qs}`);
  return data.map(mapUser);
}

/** Derniers inscrits, triés par date de création (paginated). */
export async function getLatestUsers(
  limit = 25,
  offset = 0,
): Promise<{ users: User[]; nextOffset: number | null }> {
  const data = await apiFetch<BackendUser[]>(
    `/users?sort=latest&limit=${limit}&cursor=${offset}`,
  );
  return {
    users: data.map(mapUser),
    nextOffset: data.length === limit ? offset + limit : null,
  };
}

