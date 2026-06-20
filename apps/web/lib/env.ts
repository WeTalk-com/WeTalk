/**
 * Configuration d'environnement, centralisee et typee.
 * Definir l'URL de l'API dans `.env` : NEXT_PUBLIC_API_URL=https://api.wetalk.app
 * Tant qu'elle est vide, la couche lib/api/ renvoie les donnees mock.
 */
function parseApiUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "";
  // Chemin relatif (same-origin via la gateway) : utilise tel quel.
  if (trimmed.startsWith("/")) return trimmed.replace(/\/$/, "");
  try {
    const url = new URL(trimmed);
    return (url.origin + url.pathname).replace(/\/$/, "");
  } catch {
    console.warn(`NEXT_PUBLIC_API_URL "${trimmed}" is not a valid URL — falling back to mock mode`);
    return "";
  }
}

export const env = {
  // Base navigateur : relative (/api, same-origin via gateway).
  apiUrl: parseApiUrl(process.env.NEXT_PUBLIC_API_URL),
  // Base serveur (SSR) : le fetch Node exige une URL absolue et n'a pas le cookie navigateur.
  internalApiUrl: (process.env.API_INTERNAL_URL ?? "").replace(/\/$/, ""),
} as const;

