"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bell, User } from "lucide-react";
import { CreateButton } from "../create/create-button";

/** Barre de navigation basse, affichee uniquement sous le breakpoint lg. */
export function MobileNav() {
  const pathname = usePathname();
  const cls = (href: string) =>
    `grid place-items-center p-2 ${
      pathname === href ? "text-gold" : "text-brown-sec"
    }`;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-canvas/90 px-4 py-2 backdrop-blur lg:hidden"
    >
      <Link
        href="/home"
        aria-label="Home"
        aria-current={pathname === "/home" ? "page" : undefined}
        className={cls("/home")}
      >
        <Home className="size-6" />
      </Link>
      <Link
        href="/explore"
        aria-label="Explore"
        aria-current={pathname === "/explore" ? "page" : undefined}
        className={cls("/explore")}
      >
        <Compass className="size-6" />
      </Link>
      <CreateButton variant="dock" />
      <Link
        href="/notifications"
        aria-label="Notifications"
        aria-current={pathname === "/notifications" ? "page" : undefined}
        className={cls("/notifications")}
      >
        <Bell className="size-6" />
      </Link>
      <Link
        href="/profile"
        aria-label="Profile"
        aria-current={pathname === "/profile" ? "page" : undefined}
        className={cls("/profile")}
      >
        <User className="size-6" />
      </Link>
    </nav>
  );
}
