import type { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { FeedTabs } from "../_components/feed-tabs";
import { PostCard } from "../_components/post-card";
import { RightSidebar } from "../_components/right-sidebar";
import { BottomDock } from "../_components/bottom-dock";
import { posts } from "../../lib/mock-data";

export const metadata: Metadata = {
  title: "Home · WeTalk",
};

export default function FeedPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <TopNav />

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6 px-4 py-6">
        {/* Colonne centrale : le feed */}
        <main className="min-w-0">
          <FeedTabs />
          <div className="flex flex-col gap-5 pt-5 pb-28">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        {/* Colonne droite */}
        <RightSidebar />
      </div>

      <BottomDock />
    </div>
  );
}
