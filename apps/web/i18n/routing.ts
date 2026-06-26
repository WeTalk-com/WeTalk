import { defineRouting } from "next-intl/routing";

/** Configuration de routing i18n (langues + langue par defaut). */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  pathnames: {
    "/": "/",
    "/welcome": "/welcome",
    "/login": "/login",
    "/home": "/home",
    "/explore": "/explore",
    "/messages": "/messages",
    "/assistant": "/assistant",
    "/notifications": "/notifications",
    "/profile": "/profile",
    "/profile/[handle]": "/profile/[handle]",
    "/posts/[id]": "/posts/[id]",
    "/settings": "/settings",
    "/admin": "/admin",
  },
});

export type Locale = (typeof routing.locales)[number];
