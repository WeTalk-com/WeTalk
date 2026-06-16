"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  "catAll",
  "catPhoto",
  "catTravel",
  "catDesign",
  "catFilm",
  "catFood",
] as const;

export function ExploreFilters() {
  const t = useTranslations("app.explore");
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("catAll");

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-gold text-white"
                : "bg-cream text-brown-sec hover:text-brown"
            }`}
          >
            {t(c)}
          </button>
        );
      })}
    </div>
  );
}
