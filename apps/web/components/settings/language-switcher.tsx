"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABEL_KEY = { fr: "languageFr", en: "languageEn" } as const;

/** Bascule de langue : navigue vers le meme chemin sous l'autre locale. */
export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const active = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={t("languageLabel")}>
      {routing.locales.map((locale) => {
        const selected = locale === active;
        return (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={isPending}
            onClick={() =>
              startTransition(() => router.replace(pathname, { locale }))
            }
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60 ${
              selected
                ? "border-gold bg-gold/10 text-brown"
                : "border-border bg-card text-brown-sec hover:bg-cream"
            }`}
          >
            {t(LABEL_KEY[locale])}
            {selected && <Check className="size-4 text-gold" />}
          </button>
        );
      })}
    </div>
  );
}
