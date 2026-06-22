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
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
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

  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try { body = await res.json(); } catch { /* réponse sans corps JSON */ }
    throw new ApiError(res.status, body, path);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API ${res.status} — invalid JSON response from ${path}`);
  }
}
