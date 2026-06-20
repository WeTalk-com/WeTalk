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
