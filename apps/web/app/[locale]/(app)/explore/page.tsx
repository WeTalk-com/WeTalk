import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser, getFollowingIds, getTrendingExplore, getPosts, getPostsByTag } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { ExploreContent } from "@/components/explore/explore-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "metadata",
  });
  return { title: t("explore") };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const t = await getTranslations("app.explore");
  const { q, tag } = await searchParams;
  const me = await getCurrentUser();
  const [trending, posts, followingIds] = await Promise.all([
    getTrendingExplore(),
    tag ? getPostsByTag(tag) : getPosts(),
    getFollowingIds(me.id),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder={t("searchPlaceholder")} searchable />
      <ExploreContent
        trending={trending}
        posts={posts}
        query={q ?? ""}
        activeTag={tag ?? ""}
        currentUserId={me.id}
        followingIds={followingIds}
      />
    </main>
  );
}
