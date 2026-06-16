import type { routing } from "@/i18n/routing";
import type messages from "./messages/fr.json";

// Type-safe locales + cles de traduction (verifiees a la compilation).
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
