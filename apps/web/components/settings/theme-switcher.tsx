"use client";

import { useEffect, useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { THEMES } from "../theme/themes";
import { cn } from "@/lib/cn";

/** Selecteur de theme (radiogroup) pour la page Parametres. */
export function ThemeSwitcher() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes ne connait le theme qu'apres montage cote client.
  useEffect(() => setMounted(true), []);

  return (
    <RadioGroup.Root
      value={mounted ? (theme ?? "") : ""}
      onValueChange={setTheme}
      aria-label={t("changeTheme")}
      className="flex flex-col gap-2"
    >
      {THEMES.map((option) => {
        const selected = mounted && theme === option.id;
        return (
          <RadioGroup.Item
            key={option.id}
            value={option.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
              selected ? "border-gold bg-gold/10 text-brown" : "border-border bg-card text-brown-sec hover:bg-cream",
            )}
          >
            <span
              className="size-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: option.swatch }}
            />
            {t(option.id)}
            {selected && <Check className="ml-auto size-4 text-gold" />}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
