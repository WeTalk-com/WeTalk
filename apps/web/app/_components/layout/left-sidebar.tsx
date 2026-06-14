"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Bell,
  User,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { UserChip } from "../ui/user-chip";
import { CreateButton } from "../create/create-button";
import { currentUser } from "@/lib/mock-data";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  badge?: number;
};

const NAV: NavItem[] = [
  { label: "Home", Icon: Home, href: "/home" },
  { label: "Explore", Icon: Compass, href: "/explore" },
  { label: "Notifications", Icon: Bell, href: "/notifications", badge: 3 },
  { label: "Profile", Icon: User, href: "/profile" },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col px-4 py-6 lg:flex">
      <Link
        href="/home"
        className="px-3 font-display text-3xl font-bold italic text-brown"
      >
        WeeTalk
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ label, Icon, href, badge }) => {
          const active = href !== "#" && pathname === href;
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-lg font-semibold transition-colors ${
                active
                  ? "bg-card text-brown shadow-soft"
                  : "text-brown-sec hover:bg-cream"
              }`}
            >
              <span className="relative">
                <Icon className={`size-6 ${active ? "text-gold" : ""}`} />
                {badge !== undefined && (
                  <span className="absolute -right-2 -top-2 grid size-[18px] place-items-center rounded-full bg-live text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <CreateButton variant="sidebar" />

      {/* Carte utilisateur */}
      <div className="mt-auto flex items-center gap-3 rounded-2xl px-2 py-2">
        <UserChip user={currentUser} solid className="min-w-0 flex-1" />
        <button
          type="button"
          aria-label="Account menu"
          className="text-brown-sec transition-colors hover:text-brown"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>
    </aside>
  );
}
