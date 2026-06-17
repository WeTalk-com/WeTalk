"use client";

import { useState } from "react";
import { Home, Compass, Plus, Bell, MessageCircle } from "lucide-react";
import { Avatar } from "./avatar";
import { currentUser } from "../../lib/mock-data";

const ITEMS = [
  { id: "home", label: "Accueil", Icon: Home },
  { id: "explore", label: "Explorer", Icon: Compass },
  { id: "notifs", label: "Notifications", Icon: Bell },
  { id: "messages", label: "Messages", Icon: MessageCircle },
] as const;

export function BottomDock() {
  const [active, setActive] = useState<string>("home");

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <ul className="flex items-center gap-2 rounded-full bg-dock px-3 py-2 text-white/70 shadow-lg shadow-black/20">
        {/* Accueil + Explorer */}
        {ITEMS.slice(0, 2).map(({ id, label, Icon }) => (
          <li key={id}>
            <button
              type="button"
              aria-label={label}
              onClick={() => setActive(id)}
              className={`grid place-items-center size-11 rounded-full transition-colors ${
                active === id ? "bg-gold text-white" : "hover:text-white"
              }`}
            >
              <Icon className="size-5" />
            </button>
          </li>
        ))}

        {/* Bouton creer (central, plus gros) */}
        <li>
          <button
            type="button"
            aria-label="Creer un post"
            className="grid place-items-center size-14 rounded-full bg-gold text-white hover:bg-gold-dark transition-colors"
          >
            <Plus className="size-6" />
          </button>
        </li>

        {/* Notifications + Messages */}
        {ITEMS.slice(2).map(({ id, label, Icon }) => (
          <li key={id}>
            <button
              type="button"
              aria-label={label}
              onClick={() => setActive(id)}
              className={`grid place-items-center size-11 rounded-full transition-colors ${
                active === id ? "bg-gold text-white" : "hover:text-white"
              }`}
            >
              <Icon className="size-5" />
            </button>
          </li>
        ))}

        {/* Avatar */}
        <li className="pl-1">
          <Avatar initial={currentUser.initial} size={36} />
        </li>
      </ul>
    </nav>
  );
}
