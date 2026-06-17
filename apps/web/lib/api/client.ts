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
    headers: new Headers({
      "Content-Type": "application/json",
      ...Object.fromEntries(new Headers(init?.headers ?? {})),
    }),
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${path}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API ${res.status} — invalid JSON response from ${path}`);
  }
}
