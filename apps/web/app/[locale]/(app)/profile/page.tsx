import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProfile, getPostsByAuthor, getFollowerCount, getFollowingIds } from "@/lib/api";
import { MapPin, CalendarDays } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/icons/brand";
import { EditProfileButton } from "@/components/profile/edit-profile-modal";
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

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="text-sm text-brown-sec">
      <b className="text-brown">{value}</b> {label}
    </span>
  );
}

export default async function ProfilePage() {
  const t = await getTranslations("app.profile");
  const p = await getProfile();
  const [myPosts, followerCount, followingIds] = await Promise.all([
    getPostsByAuthor(p.id),
    getFollowerCount(p.id),
    getFollowingIds(p.id),
  ]);
  p.stats.posts = myPosts.length;
  p.stats.followers = String(followerCount);
  p.stats.following = followingIds.length;
  const isNewUser = p.name === p.handle && p.bio === "";

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      {/* Banniere (Fx10) — image si définie, sinon motif design */}
      {p.bannerUrl ? (
        <div className="h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.bannerUrl} alt="" className="size-full object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />
      )}

      <div className="px-5">
        <div className="-mt-12 flex items-end justify-between">
          <span className="inline-block rounded-full ring-4 ring-canvas">
            <Avatar initial={p.initial} src={p.avatarUrl} solid size={96} />
          </span>
          <EditProfileButton profile={p} autoOpen={isNewUser} />
        </div>

        <div className="mt-3">
          <h1 className="flex items-center gap-1.5 font-display text-2xl font-extrabold text-brown">
            {p.name}
            {p.verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="text-brown-sec">@{p.handle}</p>
        </div>

        <p className="mt-3 text-brown">{p.bio}</p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-brown-sec">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {p.location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {p.joined}
          </span>
        </div>

        <div className="mt-3 flex gap-5">
          <Stat value={p.stats.posts} label={t("statPosts")} />
          <Stat value={p.stats.followers} label={t("statFollowers")} />
          <Stat value={p.stats.following} label={t("statFollowing")} />
        </div>

      </div>

      <ProfileTabs posts={myPosts} />
    </main>
  );
}
