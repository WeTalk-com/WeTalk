import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Avatar } from "./avatar";
import { currentUser } from "../../lib/mock-data";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl flex items-center gap-4 px-4 h-16">
        {/* Logo */}
        <Link href="/feed" className="font-display text-2xl font-bold shrink-0">
          Wee<em className="italic">Talk</em>
        </Link>

        {/* Recherche (cachee sur tres petit ecran) */}
        <div className="hidden sm:flex flex-1 justify-center">
          <label className="flex items-center gap-2 w-full max-w-md rounded-full bg-card border border-line px-4 py-2.5 text-ink-soft">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              placeholder="Search WeeTalk"
              className="w-full bg-transparent outline-none text-ink placeholder:text-ink-soft"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid place-items-center size-10 rounded-full hover:bg-line/60"
          >
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-live" />
          </button>
          <Avatar initial={currentUser.initial} />
        </div>
      </div>
    </header>
  );
}
