"use client";

import { useState } from "react";

/** Onglets en pilule (etat local). Generique : passe la liste d'onglets. */
export function PillTabs({ tabs }: { tabs: readonly string[] }) {
  const [active, setActive] = useState<string>(tabs[0] ?? "");

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            aria-pressed={isActive}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "border border-border bg-card text-brown shadow-soft"
                : "text-brown-sec hover:text-brown"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
