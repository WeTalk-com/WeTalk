"use client";

import { useTranslations } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Home,
  Compass,
  Bell,
  User,
  Settings,
  MessageSquare,
  MoreHorizontal,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { User as UserModel } from "@/lib/types";
import { UserChip } from "../ui/user-chip";
import { CreateButton } from "../create/create-button";
import { LogoutButton } from "../auth/logout-button";
import { useUnreadCount } from "@/lib/use-unread-count";
import { cn } from "@/lib/cn";

type NavKey = "home" | "explore" | "notifications" | "messages" | "profile" | "settings" | "admin";

type NavHref =
  | "/home"
  | "/explore"
  | "/notifications"
  | "/messages"
  | "/profile"
  | "/settings"
  | "/admin";

type NavItem = {
  key: NavKey;
  Icon: LucideIcon;
  href: NavHref;
  badge?: number;
};

export function LeftSidebar({ user }: { user: UserModel }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { count: unreadCount } = useUnreadCount();

  const isModOrAdmin = user.role === "moderator" || user.role === "admin";

  const NAV: NavItem[] = [
    { key: "home", Icon: Home, href: "/home" },
    { key: "explore", Icon: Compass, href: "/explore" },
    { key: "notifications", Icon: Bell, href: "/notifications", badge: unreadCount },
    { key: "messages", Icon: MessageSquare, href: "/messages" },
    { key: "profile", Icon: User, href: "/profile" },
    { key: "settings", Icon: Settings, href: "/settings" },
    ...(isModOrAdmin ? [{ key: "admin" as NavKey, Icon: Shield, href: "/admin" as NavHref }] : []),
  ];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[256px] shrink-0 flex-col px-3.5 py-6 lg:flex">
      <Link
        href="/home"
        className="flex items-center gap-2.5 px-3 pb-[26px] text-[26px] font-extrabold tracking-[-0.02em] text-brown"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden className="h-[38px] w-[38px]" />
        WeTalk
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ key, Icon, href, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
              "flex items-center gap-[14px] rounded-[14px] px-[16px] py-[13px] text-[18px] transition-colors",
              active ? "bg-card font-semibold text-gold shadow-soft" : "font-medium text-brown-sec",
            )}
            >
              <span className="relative">
                <Icon className={cn("size-[25px]", active && "text-gold")} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid size-[17px] place-items-center rounded-full bg-live text-[10px] font-bold leading-none text-white ring-2 ring-canvas">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <CreateButton variant="sidebar" />

      {/* Carte utilisateur */}
      <div className="mt-auto flex items-center gap-3 rounded-2xl px-2 py-2">
        <Link href="/profile" className="min-w-0 flex-1 rounded-xl transition-colors">
          <UserChip user={user} solid />
        </Link>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("accountMenu")}
              className="text-brown-sec transition-colors"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              align="end"
              sideOffset={8}
              className="z-20 min-w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card"
            >
              <LogoutButton variant="menu" />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}
