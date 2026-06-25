import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProfile, getPostsByAuthor, getLikedPosts, getUserComments } from "@/lib/api";
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
  const profile = await getProfile();
  const [myPosts, likedPosts, comments] = await Promise.all([
    getPostsByAuthor(profile.id),
    getLikedPosts(profile.id),
    getUserComments(profile.id),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      {profile.bannerUrl ? (
        <div className="h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.bannerUrl} alt="" className="size-full object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />
      )}

      <ProfileInteractive profile={profile} isSelf={true} initialFollowing={false} />

      <ProfileTabs posts={myPosts} likedPosts={likedPosts} comments={comments} />
    </main>
  );
}
