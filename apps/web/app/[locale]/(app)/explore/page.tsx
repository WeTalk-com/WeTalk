import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser, getFollowingIds, getTrending, getPosts } from "@/lib/api";
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
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("app.explore");
  const { q } = await searchParams;
  const me = await getCurrentUser();
  const [trending, posts, followingIds] = await Promise.all([
    getTrending(),
    getPosts(),
    getFollowingIds(me.id),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder={t("searchPlaceholder")} searchable />
      <ExploreContent
        trending={trending}
        posts={posts}
        query={q ?? ""}
        currentUserId={me.id}
        followingIds={followingIds}
      />
    </main>
  );
}
