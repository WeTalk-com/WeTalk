import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin, CalendarDays } from "lucide-react";
import {
  getUserProfile,
  getCurrentUser,
  getFollowingIds,
  getPostsByAuthor,
} from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/icons/brand";
import { FollowButton } from "@/components/ui/follow-button";
import { EditProfileButton } from "@/components/profile/edit-profile-modal";
import { ProfileTabs } from "@/components/profile/profile-tabs";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="text-sm text-brown-sec">
      <b className="text-brown">{value}</b> {label}
    </span>
  );
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const t = await getTranslations("app.profile");

  let profile;
  try {
    profile = await getUserProfile(handle);
  } catch {
    notFound();
  }

  const me = await getCurrentUser();
  const isSelf = me.id === profile.id;

  // Posts de la cible + état d'abonnement initial (seulement si ce n'est pas soi).
  const [posts, followingIds] = await Promise.all([
    getPostsByAuthor(profile.id),
    isSelf ? Promise.resolve<string[]>([]) : getFollowingIds(me.id),
  ]);
  profile.stats.posts = posts.length;
  const isFollowing = followingIds.includes(profile.id);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      {/* Bannière */}
      <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />

      <div className="px-5">
        <div className="-mt-12 flex items-end justify-between">
          <span className="inline-block rounded-full ring-4 ring-canvas">
            <Avatar initial={profile.initial} solid size={96} />
          </span>
          {isSelf ? (
            <EditProfileButton profile={profile} />
          ) : (
            <FollowButton userId={profile.id} initialFollowing={isFollowing} size="md" />
          )}
        </div>

        <div className="mt-3">
          <h1 className="flex items-center gap-1.5 font-display text-2xl font-extrabold text-brown">
            {profile.name}
            {profile.verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="text-brown-sec">@{profile.handle}</p>
        </div>

        <p className="mt-3 text-brown">{profile.bio}</p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-brown-sec">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {profile.location}
            </span>
          )}
          {profile.joined && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {profile.joined}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-5">
          <Stat value={profile.stats.posts} label={t("statPosts")} />
          <Stat value={profile.stats.followers} label={t("statFollowers")} />
          <Stat value={profile.stats.following} label={t("statFollowing")} />
        </div>
      </div>

      <ProfileTabs posts={posts} />
    </main>
  );
}
