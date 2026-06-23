import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProfile, getPostsByAuthor, getFollowerCount, getFollowingIds } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { ProfileInteractive } from "@/components/profile/profile-interactive";
import { ProfileTabs } from "@/components/profile/profile-tabs";

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
  return { title: t("profile") };
}

export default async function ProfilePage() {
  const p = await getProfile();
  const [myPosts, followerCount, followingIds] = await Promise.all([
    getPostsByAuthor(p.id),
    getFollowerCount(p.id),
    getFollowingIds(p.id),
  ]);
  p.stats.posts = myPosts.length;
  p.stats.followers = String(followerCount);
  p.stats.following = followingIds.length;

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      {p.bannerUrl ? (
        <div className="h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.bannerUrl} alt="" className="size-full object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />
      )}

      <ProfileInteractive profile={p} isSelf={true} initialFollowing={false} />

      <ProfileTabs posts={myPosts} />
    </main>
  );
}
