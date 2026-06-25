import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: Record<string, unknown>,
    path: string,
  ) {
    super(`API ${status} — ${path}`);
  }
}

/**
 * Wrapper fetch de l'API — point d'integration UNIQUE du back-end.
 * Isomorphe :
 *  - navigateur : base relative (/api) + cookie httpOnly envoye automatiquement.
 *  - Server Component : base interne absolue + cookie relaye depuis la requete entrante.
 */
/**
 * silent: true — supprime le redirect wetalk:unauthorized (pour les requêtes
 * non-critiques comme le HoverCard où un 401 ne doit pas forcer une déconnexion).
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { silent?: boolean },
): Promise<T> {
  const isServer = typeof window === "undefined";
  const base = isServer ? env.internalApiUrl : env.apiUrl;

  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers = new Headers(init?.headers ?? {});
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // SSR : le fetch serveur n'a pas le cookie navigateur -> on relaie celui de la requete.
  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) headers.set("cookie", cookieHeader);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      credentials: "include",
      headers,
      signal: init?.signal ?? controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`API timeout — ${path} did not respond within 10s`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try { body = await res.json(); } catch { /* réponse sans corps JSON */ }
    const error = new ApiError(res.status, body, path);
    // Côté client, signale la session expirée via un événement custom
    // pour que SessionWatcher puisse rediriger sans coupler apiFetch au routeur.
    if (!isServer && res.status === 401 && !init?.silent) {
      window.dispatchEvent(new CustomEvent("wetalk:unauthorized"));
    }
    throw error;
  }

  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API ${res.status} — invalid JSON response from ${path}`);
  }
}
