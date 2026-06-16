"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { THEMES } from "./themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const tr = useTranslations("theme");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // next-themes ne connait le theme qu'apres montage cote client
  useEffect(() => setMounted(true), []);

  // Fermer au clic exterieur
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        label={tr("changeTheme")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Palette className="size-5" />
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-card"
        >
          {THEMES.map((option) => {
            const active = mounted && theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brown transition-colors hover:bg-cream"
              >
                <span
                  className="size-4 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: option.swatch }}
                />
                {tr(option.id)}
                {active && <Check className="ml-auto size-4 text-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
