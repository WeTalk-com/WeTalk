import type { Metadata } from "next";
import { MapPin, CalendarDays } from "lucide-react";
import { TopBar } from "@/app/_components/app/top-bar";
import { Avatar } from "@/app/_components/avatar";
import { Button } from "@/app/_components/ui/button";
import { PillTabs } from "@/app/_components/ui/pill-tabs";
import { VerifiedBadge } from "@/app/_components/icons";
import { PostCard } from "@/app/_components/post-card";
import { currentUserProfile, myPosts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Profile · WeTalk",
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="text-sm text-brown-sec">
      <b className="text-brown">{value}</b> {label}
    </span>
  );
}

export default function ProfilePage() {
  const p = currentUserProfile;

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      {/* Banniere */}
      <div className="h-40 bg-gold/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(186,117,23,0.12)_14px,rgba(186,117,23,0.12)_28px)]" />

      <div className="px-5">
        <div className="-mt-12 flex items-end justify-between">
          <span className="inline-block rounded-full ring-4 ring-canvas">
            <Avatar initial={p.initial} solid size={96} />
          </span>
          <Button variant="outline" size="sm" className="mb-1">
            Edit profile
          </Button>
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
          <Stat value={p.stats.posts} label="Posts" />
          <Stat value={p.stats.followers} label="Followers" />
          <Stat value={p.stats.following} label="Following" />
        </div>

        <div className="mt-5 border-b border-border pb-2">
          <PillTabs tabs={["Posts", "Media", "Likes"]} />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {myPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
