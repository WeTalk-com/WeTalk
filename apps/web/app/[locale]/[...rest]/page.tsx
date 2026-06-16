import { notFound } from "next/navigation";

/**
 * Catch-all : toute URL non reconnue SOUS une locale (/fr/xxx, /en/xxx)
 * declenche le not-found localise ([locale]/not-found.tsx → ecran TV retro).
 */
export default function CatchAllPage() {
  notFound();
}
