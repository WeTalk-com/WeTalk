import Link from "next/link";
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  User,
  Plus,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { UserChip } from "../user-chip";
import { currentUser } from "@/lib/mock-data";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  active?: boolean;
  badge?: number;
};

const NAV: NavItem[] = [
  { label: "Home", Icon: Home, href: "/home", active: true },
  { label: "Explore", Icon: Compass, href: "#" },
  { label: "Notifications", Icon: Bell, href: "#", badge: 3 },
  { label: "Messages", Icon: MessageCircle, href: "#", badge: 2 },
  { label: "Profile", Icon: User, href: "#" },
];

export function LeftSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col px-4 py-6 lg:flex">
      <Link
        href="/home"
        className="px-3 font-display text-3xl font-bold italic text-brown"
      >
        WeeTalk
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ label, Icon, href, active, badge }) => (
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
        ))}
      </nav>

      <button
        type="button"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gold py-4 text-lg font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98]"
      >
        <Plus className="size-5" />
        Create
      </button>

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
