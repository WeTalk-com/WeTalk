import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { env } from "./lib/env";

const intlMiddleware = createMiddleware(routing);

const ACCESS_COOKIE = "wetalk_session";
const REFRESH_COOKIE = "wetalk_refresh";

/** Routes publiques accessibles sans être connecté (sans préfixe de locale). */
const PUBLIC_PATHS = ["/welcome", "/login"];

/** Routes d'auth : un utilisateur déjà connecté ne doit pas pouvoir y accéder. */
const AUTH_ONLY_PATHS = ["/login"];

/** En l'absence de NEXT_PUBLIC_API_URL, on est en mode mock : pas de garde d'auth. */
const IS_MOCK = !process.env.NEXT_PUBLIC_API_URL;

/** Marqueur anti-boucle posé après une tentative de refresh middleware. */
const REFRESH_FLAG = "_r";

export default async function middleware(req: NextRequest) {
  if (!IS_MOCK) {
    const localePrefix = new RegExp(`^/(${routing.locales.join("|")})`);
    const pathWithoutLocale = req.nextUrl.pathname.replace(localePrefix, "") || "/";
    const isPublic = PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    const matchedLocale = req.nextUrl.pathname.match(localePrefix)?.[1] ?? routing.defaultLocale;

    const hasAccess = req.cookies.has(ACCESS_COOKIE);
    const hasRefresh = req.cookies.has(REFRESH_COOKIE);
    // La session "vivante" = présence du refresh (durable 7 j), pas de l'access (15 min).
    const loggedIn = hasAccess || hasRefresh;
    const triedRefresh = req.nextUrl.searchParams.has(REFRESH_FLAG);

    // Access expiré mais refresh valide → on renouvelle côté serveur puis on rejoue
    // la même URL (le navigateur a alors les cookies frais). Une seule tentative.
    if (!hasAccess && hasRefresh && !triedRefresh) {
      try {
        const refreshed = await fetch(`${env.internalApiUrl}/auth/refresh`, {
          method: "POST",
          headers: { cookie: req.headers.get("cookie") ?? "" },
        });
        if (refreshed.ok) {
          const url = req.nextUrl.clone();
          url.searchParams.set(REFRESH_FLAG, "1");
          const res = NextResponse.redirect(url);
          for (const cookie of refreshed.headers.getSetCookie()) {
            res.headers.append("set-cookie", cookie);
          }
          return res;
        }
      } catch {
        // refresh injoignable : on retombe sur la garde ci-dessous.
      }
      // refresh KO (révoqué/expiré/injoignable) → déconnexion propre.
      if (!isPublic) {
        return NextResponse.redirect(new URL(`/${matchedLocale}/welcome`, req.url));
      }
    }

    // Access frais récupéré : on nettoie le marqueur de l'URL.
    if (hasAccess && triedRefresh) {
      const url = req.nextUrl.clone();
      url.searchParams.delete(REFRESH_FLAG);
      return NextResponse.redirect(url);
    }

    // Racine : redirige selon l'état d'authentification.
    if (pathWithoutLocale === "/") {
      const dest = loggedIn ? "home" : "welcome";
      return NextResponse.redirect(new URL(`/${matchedLocale}/${dest}`, req.url));
    }

    // Utilisateur authentifié sur la page de login → redirige vers /home
    if (isAuthOnly && loggedIn) {
      return NextResponse.redirect(new URL(`/${matchedLocale}/home`, req.url));
    }

    // Utilisateur non authentifié sur une route protégée → redirige vers /welcome
    if (!isPublic && !loggedIn) {
      return NextResponse.redirect(new URL(`/${matchedLocale}/welcome`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
