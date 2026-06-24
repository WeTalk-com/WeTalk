import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Ban } from "lucide-react";
import {
  getUserProfile,
  getCurrentUser,
  getFollowingIds,
  getPostsByAuthor,
} from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { ProfileInteractive } from "@/components/profile/profile-interactive";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let profile;
  try {
    profile = await getUserProfile(handle);
  } catch {
    notFound();
  }

  const me = await getCurrentUser();
  const isSelf = me.id === profile.id;
  const t = await getTranslations("app.profile");

  if (profile.isBanned && !isSelf) {
    return (
      <main className="min-w-0 flex-1 lg:border-x lg:border-border">
        <TopBar />
        <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />
        <div className="px-5 pt-4 pb-2">
          <div className="mb-4 size-16 rounded-full bg-border" />
          <p className="font-head text-lg font-bold text-brown">@{profile.handle}</p>
        </div>
        <div className="mx-5 mt-2 flex items-start gap-3 rounded-xl border border-live/30 bg-live/5 p-4">
          <Ban className="mt-0.5 size-5 shrink-0 text-live" />
          <div>
            <p className="text-sm font-semibold text-live">{t("bannedTitle")}</p>
            <p className="mt-0.5 text-sm text-brown-sec">{t("bannedText")}</p>
          </div>
        </div>
      </main>
    );
  }

  const [posts, viewerFollowingIds] = await Promise.all([
    getPostsByAuthor(profile.id),
    isSelf ? Promise.resolve<string[]>([]) : getFollowingIds(me.id),
  ]);
  const isFollowing = viewerFollowingIds.includes(profile.id);

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

      <ProfileInteractive
        profile={profile}
        isSelf={isSelf}
        initialFollowing={isFollowing}
      />

      <ProfileTabs posts={posts} />
    </main>
  );
}
