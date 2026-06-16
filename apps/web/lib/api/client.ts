import { env } from "@/lib/env";

/**
 * Wrapper fetch de l'API — point d'integration UNIQUE du back-end.
 *
 * Aujourd'hui les fonctions de lib/api/ renvoient les mocks ; le jour ou le
 * back existe, on remplace `return <mock>` par `return apiFetch(...)` et c'est
 * le seul endroit a modifier.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${path}`);
  }

  return (await res.json()) as T;
}
