"use client";

import { useState } from "react";
import { TrendingUp, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Post, TrendingTopic, User } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { UserChip } from "@/components/ui/user-chip";
import { Button } from "@/components/ui/button";

type Tab = "trending" | "foryou" | "people";

export function ExploreContent({
  posts,
  trending,
  users,
}: {
  posts: Post[];
  trending: TrendingTopic[];
  users: User[];
}) {
  const t = useTranslations("app.explore");
  const tRail = useTranslations("app.rightRail");
  const [tab, setTab] = useState<Tab>("trending");

  const tabs: { key: Tab; label: string }[] = [
    { key: "trending", label: t("tabTrending") },
    { key: "foryou", label: t("tabForYou") },
    { key: "people", label: t("tabPeople") },
  ];

  return (
    <>
      {/* Onglets style Twitter */}
      <div className="flex border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              tab === key ? "text-brown" : "text-brown-sec hover:text-brown"
            }`}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-0 left-1/2 h-0.75 w-12 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Tendances */}
      {tab === "trending" && (
        <ul>
          {trending.map((topic, i) => (
            <li
              key={topic.tag}
              className="group flex cursor-pointer items-start gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-card last:border-0"
            >
              <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-brown-sec">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-brown-sec">
                  {topic.category} · {t("trending")}
                </p>
                <p className="flex items-center gap-1.5 font-bold text-brown">
                  <TrendingUp className="size-4 shrink-0 text-gold" />
                  {topic.tag}
                </p>
                <p className="mt-0.5 text-xs text-brown-sec">{topic.posts}</p>
              </div>
              <button
                type="button"
                aria-label="Plus"
                className="mt-0.5 shrink-0 rounded-full p-1 text-brown-sec opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gold/10 hover:text-gold"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pour vous — feed de posts */}
      {tab === "foryou" && (
        <div className="flex flex-col gap-5 px-4 pb-24 pt-4 lg:pb-10">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Personnes */}
      {tab === "people" && (
        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <Link href={`/profile/${u.handle}`} className="min-w-0 flex-1">
                <UserChip user={u} />
              </Link>
              <Button size="sm">{tRail("follow")}</Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
