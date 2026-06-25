import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ErrorScreen } from "@/components/error-screen/error-screen";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Not-found racine : filet de securite pour les URLs hors de toute locale.
 * Rendu en dehors du layout [locale], il fournit donc son propre <html>/<body>.
 * Utilise la locale par defaut car aucun contexte i18n n'est disponible ici.
 */
export default async function GlobalNotFound() {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: "errors",
  });

  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
      <body className={fontVariables}>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
          <ErrorScreen code="404" label={t("notFoundLabel")} />
          <p className="text-brown-sec">{t("notFoundMessage")}</p>
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gold px-7 font-bold text-white shadow-gold transition-all active:scale-[0.98]"
          >
            {t("notFoundCta")}
          </Link>
        </main>
      </body>
    </html>
  );
}
