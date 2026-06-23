import { notFound } from "next/navigation";
import {
  getUserProfile,
  getCurrentUser,
  getFollowingIds,
  getFollowerCount,
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

  const [posts, viewerFollowingIds, followerCount, profileFollowingIds] = await Promise.all([
    getPostsByAuthor(profile.id),
    isSelf ? Promise.resolve<string[]>([]) : getFollowingIds(me.id),
    getFollowerCount(profile.id),
    getFollowingIds(profile.id),
  ]);
  profile.stats.posts = posts.length;
  profile.stats.followers = String(followerCount);
  profile.stats.following = profileFollowingIds.length;
  const isFollowing = viewerFollowingIds.includes(profile.id);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />

      <ProfileInteractive
        profile={profile}
        isSelf={isSelf}
        initialFollowing={isFollowing}
      />

      <ProfileTabs posts={posts} />
    </main>
  );
}
