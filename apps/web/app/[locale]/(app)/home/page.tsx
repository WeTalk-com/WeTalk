import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPosts, getCurrentUser, getWhoToFollow, getTrending } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { RightRail } from "@/components/home/right-rail";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Composer } from "@/components/home/composer";
import { PostCard } from "@/components/post/post-card";

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
  return { title: t("home") };
}

export default async function HomePage() {
  const t = await getTranslations("app.home");
  const [posts, user, whoToFollow, trending] = await Promise.all([
    getPosts(),
    getCurrentUser(),
    getWhoToFollow(),
    getTrending(),
  ]);

  return (
    <>
      <main className="min-w-0 flex-1 lg:border-x lg:border-border">
        <TopBar />

        <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-4">
          <h1 className="font-display text-4xl font-bold text-brown">
            {t("title")}
          </h1>
          <PillTabs tabs={[t("tabForYou"), t("tabFollowing")]} />
        </div>

        <div className="flex flex-col gap-5 px-4 pb-24 lg:pb-10">
          <Composer user={user} />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      <RightRail users={whoToFollow} topics={trending} />
    </>
  );
}
