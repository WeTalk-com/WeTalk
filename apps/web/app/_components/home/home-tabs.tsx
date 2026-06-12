"use client";

import { useState } from "react";

const TABS = ["For you", "Following"] as const;

export function HomeTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]>("For you");

  return (
    <div className="flex items-center gap-1">
      {TABS.map((tab) => {
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
