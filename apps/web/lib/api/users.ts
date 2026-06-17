import type { User, Profile } from "@/lib/types";
import { currentUser, currentUserProfile, whoToFollow } from "@/lib/mock-data";

/** Utilisateur connecte (proviendra de la session/auth). */
export async function getCurrentUser(): Promise<User> {
  // TODO(api): return apiFetch<User>("/me");
  return structuredClone(currentUser);
}

/** Profil affiche (par handle ; ici le profil courant). */
export async function getProfile(): Promise<Profile> {
  // TODO(api): return apiFetch<Profile>(`/users/${handle}`);
  return structuredClone(currentUserProfile);
}

/** Suggestions "a suivre". */
export async function getWhoToFollow(): Promise<User[]> {
  // TODO(api): return apiFetch<User[]>("/suggestions/follow");
  return structuredClone(whoToFollow);
}
