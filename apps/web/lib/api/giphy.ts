// Recherche de GIF via l'API Giphy (clé publique côté client, modèle prévu par Giphy).
const KEY = process.env.NEXT_PUBLIC_GIPHY_KEY;

export type Gif = {
  id: string;
  previewUrl: string; // version légère pour la grille
  url: string; // GIF original (téléchargé puis uploadé comme image du post)
  title: string;
};

type GiphyItem = {
  id: string;
  title: string;
  images: {
    fixed_width_small: { url: string };
    original: { url: string };
  };
};

/** Recherche (ou tendances si requête vide) — 24 résultats, filtre pg-13. */
export async function searchGifs(query: string): Promise<Gif[]> {
  if (!KEY) return [];
  const q = query.trim();
  const base = q
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}`
    : "https://api.giphy.com/v1/gifs/trending?";
  const res = await fetch(`${base}&api_key=${KEY}&limit=24&rating=pg-13`);
  if (!res.ok) return [];
  const json: { data: GiphyItem[] } = await res.json();
  return json.data.map((g) => ({
    id: g.id,
    previewUrl: g.images.fixed_width_small.url,
    url: g.images.original.url,
    title: g.title,
  }));
}

/** Télécharge un GIF et le convertit en File réutilisable par l'upload média existant. */
export async function gifToFile(gif: Gif): Promise<File> {
  const res = await fetch(gif.url);
  const blob = await res.blob();
  return new File([blob], `giphy-${gif.id}.gif`, { type: "image/gif" });
}
