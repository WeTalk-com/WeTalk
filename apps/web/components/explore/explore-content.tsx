"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { TrendingUp, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TrendingTopic, User } from "@/lib/types";
import { UserChip } from "@/components/ui/user-chip";
import { FollowButton } from "@/components/ui/follow-button";

export function ExploreContent({
  trending,
  users: initialUsers,
  query = "",
}: {
  trending: TrendingTopic[];
  users: User[];
  query?: string;
}) {
  const t = useTranslations("app.explore");
  const [users, setUsers] = useState(initialUsers);

  // Sync avec le serveur quand la prop change (nouveau résultat de recherche)
  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  const q = query.toLowerCase().trim().replace(/^@/, "");
  const filteredTrending = q
    ? trending.filter(
        (tp) =>
          tp.tag.toLowerCase().includes(q) ||
          tp.category.toLowerCase().includes(q),
      )
    : trending;
  const tabList = [
    { key: "trending", label: t("tabTrending") },
    { key: "people", label: t("tabPeople") },
  ] as const;

  return (
    <Tabs.Root defaultValue="trending">
      <Tabs.List className="flex border-b border-border">
        {tabList.map(({ key, label }) => (
          <Tabs.Trigger
            key={key}
            value={key}
            className="relative flex-1 py-4 text-sm font-semibold text-brown-sec transition-colors hover:text-brown data-[state=active]:text-brown"
          >
            {label}
            <span className="absolute bottom-0 left-1/2 h-0.75 w-12 -translate-x-1/2 rounded-full bg-gold opacity-0 transition-opacity data-[state=active]:opacity-100" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tendances */}
      <Tabs.Content value="trending">
        <ul>
          {filteredTrending.map((topic, i) => (
            <li
              key={topic.tag}
              className="group flex cursor-pointer items-start gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-card last:border-0"
            >
              <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-brown-sec">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-brown-sec">{topic.category} · {t("trending")}</p>
                <p className="flex items-center gap-1.5 font-bold text-brown">
                  <TrendingUp className="size-4 shrink-0 text-gold" />
                  {topic.tag}
                </p>
                <p className="mt-0.5 text-xs text-brown-sec">{topic.posts}</p>
              </div>
              <button
                type="button"
                aria-label={t("moreOptions")}
                className="mt-0.5 shrink-0 rounded-full p-1 text-brown-sec opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gold/10 hover:text-gold"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </Tabs.Content>

      {/* Suggestions */}
      <Tabs.Content value="people">
        <ul>
          {users.length > 0 ? (
            users.map((u) => (
              <li key={u.id} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                <Link href={{ pathname: "/profile/[handle]", params: { handle: u.handle } }} className="min-w-0 flex-1">
                  <UserChip user={u} />
                </Link>
                <FollowButton
                  userId={u.id}
                  onFollow={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
                />
              </li>
            ))
          ) : (
            <li className="py-12 text-center text-sm text-brown-sec">{t("noResults", { query })}</li>
          )}
        </ul>
      </Tabs.Content>
    </Tabs.Root>
  );
}
