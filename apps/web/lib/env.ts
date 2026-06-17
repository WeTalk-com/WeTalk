/**
 * Configuration d'environnement, centralisee et typee.
 * Definir l'URL de l'API dans `.env` : NEXT_PUBLIC_API_URL=https://api.wetalk.app
 * Tant qu'elle est vide, la couche lib/api/ renvoie les donnees mock.
 */
function parseApiUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    return (url.origin + url.pathname).replace(/\/$/, "");
  } catch {
    console.warn(`NEXT_PUBLIC_API_URL "${trimmed}" is not a valid URL — falling back to mock mode`);
    return "";
  }
}

export const env = {
  apiUrl: parseApiUrl(process.env.NEXT_PUBLIC_API_URL),
} as const;

/** Vrai quand une vraie API est configuree (sinon : mode mock). */
export const isApiConfigured = env.apiUrl.length > 0;
