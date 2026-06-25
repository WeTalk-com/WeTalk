import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const SESSION_COOKIE = "wetalk_session";

/** Routes publiques accessibles sans être connecté (sans préfixe de locale). */
const PUBLIC_PATHS = ["/welcome", "/login"];

/** Routes d'auth : un utilisateur déjà connecté ne doit pas pouvoir y accéder. */
const AUTH_ONLY_PATHS = ["/login"];

/** En l'absence de NEXT_PUBLIC_API_URL, on est en mode mock : pas de garde d'auth. */
const IS_MOCK = !process.env.NEXT_PUBLIC_API_URL;

export default function middleware(req: NextRequest) {
  if (!IS_MOCK) {
    const localePrefix = new RegExp(`^/(${routing.locales.join("|")})`);
    const pathWithoutLocale = req.nextUrl.pathname.replace(localePrefix, "") || "/";
    const isPublic = PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    const hasSession = req.cookies.has(SESSION_COOKIE);
    const matchedLocale = req.nextUrl.pathname.match(localePrefix)?.[1] ?? routing.defaultLocale;

    // Utilisateur authentifié sur la page de login → redirige vers /home
    if (isAuthOnly && hasSession) {
      return NextResponse.redirect(new URL(`/${matchedLocale}/home`, req.url));
    }

    // Utilisateur non authentifié sur une route protégée → redirige vers /login
    if (!isPublic && !hasSession) {
      const loginUrl = new URL(`/${matchedLocale}/login`, req.url);
      loginUrl.searchParams.set("redirect", pathWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
