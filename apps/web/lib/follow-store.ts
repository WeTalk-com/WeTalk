// État de suivi global partagé par userId entre toutes les instances de FollowButton
// (hover, carte post, profil, suggestions) → mise à jour immédiate partout.
import { useSyncExternalStore } from "react";

const state = new Map<string, boolean>();
const listeners = new Set<() => void>();

export function setFollowing(userId: string, value: boolean) {
  state.set(userId, value);
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Renvoie l'override du store si l'utilisateur a interagi, sinon la valeur initiale (serveur). */
export function useFollowing(userId: string, initial: boolean): boolean {
  const get = () => state.get(userId);
  return useSyncExternalStore(subscribe, get, get) ?? initial;
}
