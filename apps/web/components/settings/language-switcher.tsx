"use client";

import { useTransition } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const LABEL_KEY = { fr: "languageFr", en: "languageEn" } as const;

/** Bascule de langue : navigue vers le meme chemin sous l'autre locale. */
export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const active = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <RadioGroup.Root
      value={active}
      onValueChange={(locale) =>
        startTransition(() =>
          router.replace(
            // @ts-expect-error -- pathname dynamique sans params, renavigation même route
            pathname,
            { locale },
          ),
        )
      }
      aria-label={t("languageLabel")}
      disabled={isPending}
      className="flex flex-col gap-2"
    >
      {routing.locales.map((locale) => {
        const selected = locale === active;
        return (
          <RadioGroup.Item
            key={locale}
            value={locale}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60",
              selected ? "border-gold bg-gold/10 text-brown" : "border-border bg-card text-brown-sec",
            )}
          >
            {t(LABEL_KEY[locale])}
            {selected && <Check className="size-4 text-gold" />}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
