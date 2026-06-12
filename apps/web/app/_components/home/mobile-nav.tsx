import Link from "next/link";
import { Home, Compass, Plus, Bell, User } from "lucide-react";

/** Barre de navigation basse, affichee uniquement sous le breakpoint lg. */
export function MobileNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-canvas/90 px-4 py-2 backdrop-blur lg:hidden"
    >
      <Link
        href="/home"
        aria-label="Home"
        aria-current="page"
        className="grid place-items-center p-2 text-gold"
      >
        <Home className="size-6" />
      </Link>
      <Link
        href="#"
        aria-label="Explore"
        className="grid place-items-center p-2 text-brown-sec"
      >
        <Compass className="size-6" />
      </Link>
      <button
        type="button"
        aria-label="Create a post"
        className="grid size-12 place-items-center rounded-full bg-gold text-white shadow-gold"
      >
        <Plus className="size-6" />
      </button>
      <Link
        href="#"
        aria-label="Notifications"
        className="grid place-items-center p-2 text-brown-sec"
      >
        <Bell className="size-6" />
      </Link>
      <Link
        href="#"
        aria-label="Profile"
        className="grid place-items-center p-2 text-brown-sec"
      >
        <User className="size-6" />
      </Link>
    </nav>
  );
}
