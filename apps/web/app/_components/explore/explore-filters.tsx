"use client";

import { useState } from "react";
import { exploreCategories } from "@/lib/mock-data";

export function ExploreFilters() {
  const [active, setActive] = useState<string>(exploreCategories[0]);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {exploreCategories.map((c) => {
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
            {c}
          </button>
        );
      })}
    </div>
  );
}
