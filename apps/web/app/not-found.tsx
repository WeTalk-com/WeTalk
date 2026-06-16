import Link from "next/link";
import { ErrorScreen } from "@/components/error-screen/error-screen";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Not-found racine : filet de securite pour les URLs hors de toute locale.
 * Rendu en dehors du layout [locale], il fournit donc son propre <html>/<body>.
 * Textes en langue par defaut (FR).
 */
export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
      <body className={fontVariables}>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
          <ErrorScreen code="404" label="INTROUVABLE" />
          <p className="text-brown-sec">
            Le coin chaleureux que vous cherchez n’existe pas (encore).
          </p>
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gold px-7 font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98]"
          >
            Retour à l’accueil
          </Link>
        </main>
      </body>
    </html>
  );
}
