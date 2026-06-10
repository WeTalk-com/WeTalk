"use client";

import { useState } from "react";

const TABS = ["For you", "Following"] as const;

export function FeedTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]>("For you");

  return (
    <div className="flex gap-8 border-b border-line px-2">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`relative py-4 text-sm font-medium transition-colors ${
              isActive ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab}
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-gold" />
            )}
          </button>
        );
      })}
    </div>
  );
}
