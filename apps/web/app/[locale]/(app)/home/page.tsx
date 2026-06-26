import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPosts, getTrendingHome, getCurrentUser, getFollowingIds } from "@/lib/api";
import { HomeComposer } from "@/components/home/home-composer";
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
  const me = await getCurrentUser();
  const [posts, trending, followingIds] = await Promise.all([
    getPosts(),
    getTrendingHome(),
    getFollowingIds(me.id),
  ]);

  return (
    <>
      <main className="min-w-0 flex-1 px-4 pb-24 pt-7 lg:px-8 lg:pb-[90px]">
        <div className="mx-auto max-w-[600px]">
          <HomeComposer user={me} />

          <div className="flex flex-col gap-[22px]">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isFollowingAuthor={followingIds.includes(post.author.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <RightRail topics={trending} />
    </>
  );
}
