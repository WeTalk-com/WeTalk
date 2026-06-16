"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, Compass, Bell, User } from "lucide-react";
import { CreateButton } from "../create/create-button";

/** Barre de navigation basse, affichee uniquement sous le breakpoint lg. */
export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const cls = (href: string) =>
    `grid place-items-center p-2 ${
      pathname === href ? "text-gold" : "text-brown-sec"
    }`;

  return (
    <nav
      aria-label={t("primary")}
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-canvas/90 px-4 py-2 backdrop-blur lg:hidden"
    >
      <Link
        href="/home"
        aria-label={t("home")}
        aria-current={pathname === "/home" ? "page" : undefined}
        className={cls("/home")}
      >
        <Home className="size-6" />
      </Link>
      <Link
        href="/explore"
        aria-label={t("explore")}
        aria-current={pathname === "/explore" ? "page" : undefined}
        className={cls("/explore")}
      >
        <Compass className="size-6" />
      </Link>
      <CreateButton variant="dock" />
      <Link
        href="/notifications"
        aria-label={t("notifications")}
        aria-current={pathname === "/notifications" ? "page" : undefined}
        className={cls("/notifications")}
      >
        <Bell className="size-6" />
      </Link>
      <Link
        href="/profile"
        aria-label={t("profile")}
        aria-current={pathname === "/profile" ? "page" : undefined}
        className={cls("/profile")}
      >
        <User className="size-6" />
      </Link>
    </nav>
  );
}
