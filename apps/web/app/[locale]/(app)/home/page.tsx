import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFeed, getTrending } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { RightRail } from "@/components/home/right-rail";
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
  const [posts, trending] = await Promise.all([getFeed(), getTrending()]);

  return (
    <>
      <main className="min-w-0 flex-1 lg:border-x lg:border-border">
        <TopBar />

        <div className="flex flex-col gap-5 px-4 pb-24 pt-4 lg:pb-10">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      <RightRail topics={trending} />
    </>
  );
}
