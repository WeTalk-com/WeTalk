"use client";

import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/types";
import { getUserProfile, getFollowingIds } from "@/lib/api/users";
import { Avatar } from "./avatar";
import { VerifiedBadge } from "../icons/brand";
import { FollowButton } from "./follow-button";
import { useCurrentUserId } from "@/components/create/create-modal-provider";

export function UserHoverCard({
  handle,
  children,
}: {
  handle: string;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [following, setFollowing] = useState<boolean>();
  const t = useTranslations("app.profile");
  const currentUserId = useCurrentUserId();

  async function onOpen() {
    try {
      const p = await getUserProfile(handle);
      setProfile(p);
      // État de suivi non renvoyé par le profil back → on le déduit de mes abonnements.
      if (currentUserId && currentUserId !== p.id) {
        const ids = await getFollowingIds(currentUserId);
        setFollowing(ids.includes(p.id));
      }
    } catch {
      // HoverCard est non-critique — on ignore silencieusement
    }
  }

  const isOwnProfile = !!currentUserId && !!profile && currentUserId === profile.id;

  return (
    <HoverCard.Root openDelay={400} closeDelay={150} onOpenChange={(open) => { if (open) onOpen(); else { setProfile(null); setFollowing(undefined); } }}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions
          className="z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          {profile ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <Link href={{ pathname: "/profile/[handle]", params: { handle: profile.handle } }}>
                  <Avatar initial={profile.initial} src={profile.avatarUrl} size={48} solid />
                </Link>
                {!isOwnProfile && following !== undefined && (
                  <FollowButton userId={profile.id} initialFollowing={following} size="sm" />
                )}
              </div>

              <div className="mt-2">
                <div className="flex items-center gap-1 font-semibold text-brown leading-tight">
                  {profile.name}
                  {profile.verified && <VerifiedBadge className="size-4 shrink-0" />}
                </div>
                <p className="text-sm text-brown-sec">@{profile.handle}</p>
                {profile.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-brown">{profile.bio}</p>
                )}
                <div className="mt-3 flex gap-4 text-sm">
                  <span>
                    <span className="font-semibold text-brown">{profile.stats.posts}</span>{" "}
                    <span className="text-brown-sec">{t("statPosts")}</span>
                  </span>
                  <span>
                    <span className="font-semibold text-brown">{profile.stats.followers}</span>{" "}
                    <span className="text-brown-sec">{t("statFollowers")}</span>
                  </span>
                  <span>
                    <span className="font-semibold text-brown">{profile.stats.following}</span>{" "}
                    <span className="text-brown-sec">{t("statFollowing")}</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-pulse space-y-3">
              <div className="size-12 rounded-full bg-border" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 rounded-full bg-border" />
                <div className="h-3 w-24 rounded-full bg-border" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-12 rounded-full bg-border" />
                <div className="h-3 w-12 rounded-full bg-border" />
                <div className="h-3 w-12 rounded-full bg-border" />
              </div>
            </div>
          )}
          <HoverCard.Arrow className="fill-border" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
