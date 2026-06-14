import type { Metadata } from "next";
import { TopBar } from "@/app/_components/app/top-bar";
import { RightRail } from "@/app/_components/home/right-rail";
import { PillTabs } from "@/app/_components/ui/pill-tabs";
import { Composer } from "@/app/_components/home/composer";
import { PostCard } from "@/app/_components/post-card";
import { posts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Home · WeTalk",
};

export default function HomePage() {
  return (
    <>
      <main className="min-w-0 flex-1 lg:border-x lg:border-border">
        <TopBar />

        <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-4">
          <h1 className="font-display text-4xl font-bold text-brown">Home</h1>
          <PillTabs tabs={["For you", "Following"]} />
        </div>

        <div className="flex flex-col gap-5 px-4 pb-24 lg:pb-10">
          <Composer />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      <RightRail />
    </>
  );
}
