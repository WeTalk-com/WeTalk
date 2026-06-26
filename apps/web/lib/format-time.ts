import { format, register } from "timeago.js";
import fr from "timeago.js/esm/lang/fr";

register("fr", fr);

export function formatTimeAgo(iso: string, locale: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  // Décalage d'horloge serveur/navigateur : un post tout neuf peut avoir
  // un createdAt légèrement dans le futur → timeago affiche "dans un instant".
  // On ramène toute date future à maintenant pour garder "à l'instant".
  const now = Date.now();
  const safe = date.getTime() > now ? new Date(now) : date;
  const result = format(safe, locale === "fr" ? "fr" : "en_US");
  // Supprimer le préfixe/suffixe narratif pour un affichage compact.
  return result.replace(/^il y a /, "").replace(/ ago$/, "");
}
