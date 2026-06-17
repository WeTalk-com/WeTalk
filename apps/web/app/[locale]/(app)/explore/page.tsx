import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getTrending, getWhoToFollow, getPosts } from "@/lib/api";
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

export default async function ExplorePage() {
  const t = await getTranslations("app.explore");
  const [trending, users, posts] = await Promise.all([
    getTrending(),
    getWhoToFollow(),
    getPosts(),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder={t("searchPlaceholder")} />
      <ExploreContent trending={trending} users={users} posts={posts} />
    </main>
  );
}
