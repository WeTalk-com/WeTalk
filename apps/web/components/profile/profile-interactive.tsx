"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, CalendarDays } from "lucide-react";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/icons/brand";
import { FollowButton } from "@/components/ui/follow-button";
import { EditProfileButton } from "@/components/profile/edit-profile-modal";
import { FollowListModal } from "@/components/profile/follow-list-modal";

type ModalType = "followers" | "following" | null;

function StatButton({
  value,
  label,
  onClick,
}: {
  value: string | number;
  label: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-sm text-brown-sec hover:underline"
      >
        <b className="text-brown">{value}</b> {label}
      </button>
    );
  }
  return (
    <span className="text-sm text-brown-sec">
      <b className="text-brown">{value}</b> {label}
    </span>
  );
}

export function ProfileInteractive({
  profile,
  isSelf,
  initialFollowing,
}: {
  profile: Profile;
  isSelf: boolean;
  initialFollowing: boolean;
}) {
  const t = useTranslations("app.profile");
  const [followerCount, setFollowerCount] = useState(
    parseInt(profile.stats.followers, 10) || 0,
  );
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="px-5">
      <div className="-mt-12 flex items-end justify-between">
        <span className="inline-block rounded-full ring-4 ring-canvas">
          <Avatar initial={profile.initial} src={profile.avatarUrl} solid size={96} />
        </span>
        {isSelf ? (
          <EditProfileButton profile={profile} />
        ) : (
          <FollowButton
            userId={profile.id}
            initialFollowing={initialFollowing}
            size="md"
            onFollow={() => setFollowerCount((c) => c + 1)}
            onUnfollow={() => setFollowerCount((c) => c - 1)}
          />
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
        <StatButton value={profile.stats.posts} label={t("statPosts")} />
        <StatButton
          value={followerCount}
          label={t("statFollowers")}
          onClick={() => setModal("followers")}
        />
        <StatButton
          value={profile.stats.following}
          label={t("statFollowing")}
          onClick={() => setModal("following")}
        />
      </div>

      <FollowListModal
        userId={profile.id}
        type={modal ?? "followers"}
        title={modal === "following" ? t("statFollowing") : t("statFollowers")}
        isOpen={modal !== null}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
