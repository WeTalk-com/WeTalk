"use client";

import { useState, useEffect, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { TrendingUp, MoreHorizontal, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Post, TrendingTopic, User } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { UserChip } from "@/components/ui/user-chip";
import { FollowButton } from "@/components/ui/follow-button";
import { searchUsers, getLatestUsers } from "@/lib/api";

export function ExploreContent({
  posts,
  trending,
  query = "",
  currentUserId,
  followingIds,
}: {
  posts: Post[];
  trending: TrendingTopic[];
  query?: string;
  currentUserId: string;
  followingIds: string[];
}) {
  const t = useTranslations("app.explore");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    setVisibleCount(10);
    try {
      if (q) {
        const data = await searchUsers(q);
        setUsers(data.filter((u) => u.id !== currentUserId && !followingIds.includes(u.id)));
      } else {
        const { users: data } = await getLatestUsers(25, 0);
        setUsers(data.filter((u) => u.id !== currentUserId && !followingIds.includes(u.id)));
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, followingIds]);

  useEffect(() => {
    fetchUsers(query);
  }, [query, fetchUsers]);

  const shownUsers = users.slice(0, visibleCount);
  const hasMore = visibleCount < users.length;

  const q = query.toLowerCase().trim().replace(/^@/, "");
  const filteredPosts = q
    ? posts.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          p.author.name.toLowerCase().includes(q),
      )
    : posts;
  const filteredTrending = q
    ? trending.filter((tp) => tp.tag.toLowerCase().includes(q))
    : trending;
  const tabList = [
    { key: "trending", label: t("tabTrending") },
    { key: "foryou", label: t("tabForYou") },
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
                <p className="text-xs text-brown-sec">{t("trending")}</p>
                <p className="flex items-center gap-1.5 font-bold text-brown">
                  <TrendingUp className="size-4 shrink-0 text-gold" />
                  #{topic.tag}
                </p>
                <p className="mt-0.5 text-xs text-brown-sec">{t("postCount", { count: topic.count })}</p>
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

      {/* Pour vous */}
      <Tabs.Content value="foryou" className="flex flex-col gap-5 px-4 pb-24 pt-4 lg:pb-10">
        {filteredPosts.length > 0
          ? filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          : <p className="py-12 text-center text-sm text-brown-sec">{t("noResults", { query })}</p>}
      </Tabs.Content>

      {/* Personnes */}
      <Tabs.Content value="people">
        <ul>
          {loading && users.length === 0 ? (
            <li className="flex justify-center py-12 text-brown-sec">
              <Loader2 className="size-5 animate-spin" />
            </li>
          ) : shownUsers.length > 0 ? (
            <>
              {shownUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                  <Link href={{ pathname: "/profile/[handle]", params: { handle: u.handle } }} className="min-w-0 flex-1">
                    <UserChip user={u} />
                  </Link>
                  <FollowButton
                    userId={u.id}
                    onFollow={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
                  />
                </li>
              ))}
              {hasMore && (
                <li className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(25)}
                    disabled={loading}
                    className="w-full rounded-full border border-border py-2 text-sm font-semibold text-brown transition-colors hover:bg-card disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    ) : (
                      t("loadMore")
                    )}
                  </button>
                </li>
              )}
            </>
          ) : (
            <li className="py-12 text-center text-sm text-brown-sec">{t("noResults", { query })}</li>
          )}
        </ul>
      </Tabs.Content>
    </Tabs.Root>
  );
}
