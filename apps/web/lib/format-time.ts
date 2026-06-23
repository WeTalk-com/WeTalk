import { format, register } from "timeago.js";
import fr from "timeago.js/esm/lang/fr";

register("fr", fr);

export function formatTimeAgo(iso: string, locale: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return format(date, locale === "fr" ? "fr" : "en_US");
}
