/**
 * Configuration d'environnement, centralisee et typee.
 * Definir l'URL de l'API dans `.env` : NEXT_PUBLIC_API_URL=https://api.wetalk.app
 * Tant qu'elle est vide, la couche lib/api/ renvoie les donnees mock.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
} as const;

/** Vrai quand une vraie API est configuree (sinon : mode mock). */
export const isApiConfigured = env.apiUrl.length > 0;
