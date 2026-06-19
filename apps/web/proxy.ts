import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Nom du cookie de session posé par le back-end après authentification.
 * À aligner avec l'équipe back (httpOnly, Secure, SameSite=Lax recommandé).
 */
const SESSION_COOKIE = "wetalk_session";

/** Routes publiques accessibles sans être connecté (sans préfixe de locale). */
const PUBLIC_PATHS = ["/welcome", "/login"];

/** En l'absence de NEXT_PUBLIC_API_URL, on est en mode mock : pas de garde d'auth. */
const IS_MOCK = !process.env.NEXT_PUBLIC_API_URL;

export default function middleware(req: NextRequest) {
  if (!IS_MOCK) {
    const localePrefix = new RegExp(`^/(${routing.locales.join("|")})`);
    const pathWithoutLocale = req.nextUrl.pathname.replace(localePrefix, "") || "/";
    const isPublic = PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));

    if (!isPublic && !req.cookies.has(SESSION_COOKIE)) {
      const matchedLocale = req.nextUrl.pathname.match(localePrefix)?.[1] ?? routing.defaultLocale;
      const loginUrl = new URL(`/${matchedLocale}/login`, req.url);
      // Mémoriser l'URL d'origine pour rediriger après connexion
      loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Applique le middleware à tout sauf les assets internes et les fichiers.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
