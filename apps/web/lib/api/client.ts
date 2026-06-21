import { env } from "@/lib/env";

/**
 * Wrapper fetch de l'API — point d'integration UNIQUE du back-end.
 * Isomorphe :
 *  - navigateur : base relative (/api) + cookie httpOnly envoye automatiquement.
 *  - Server Component : base interne absolue + cookie relaye depuis la requete entrante.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isServer = typeof window === "undefined";
  const base = isServer ? env.internalApiUrl : env.apiUrl;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(init?.headers ?? {})),
  });

  // SSR : le fetch serveur n'a pas le cookie navigateur -> on relaie celui de la requete.
  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) headers.set("cookie", cookieHeader);
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers,
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
