import type { Metadata } from "next";
import { Search, Sparkles } from "lucide-react";
import { IconButton } from "../_components/ui/icon-button";
import { ThemeToggle } from "../_components/ui/theme-toggle";
import { LeftSidebar } from "../_components/home/left-sidebar";
import { RightRail } from "../_components/home/right-rail";
import { MobileNav } from "../_components/home/mobile-nav";
import { HomeTabs } from "../_components/home/home-tabs";
import { Composer } from "../_components/home/composer";
import { PostCard } from "../_components/post-card";
import { posts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Home · WeTalk",
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex w-full max-w-[1240px]">
        <LeftSidebar />

        {/* Colonne centrale */}
        <main className="min-w-0 flex-1 lg:border-x lg:border-border">
          {/* Barre superieure : recherche + actions */}
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-brown-sec">
              <Search className="size-5 shrink-0" />
              <input
                type="search"
                placeholder="Search WeeTalk"
                aria-label="Search WeeTalk"
                className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
              />
            </div>
            <IconButton label="AI suggestions">
              <Sparkles className="size-5" />
            </IconButton>
            <ThemeToggle />
          </div>

          {/* En-tete : titre + onglets */}
          <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-4">
            <h1 className="font-display text-4xl font-bold text-brown">Home</h1>
            <HomeTabs />
          </div>

          {/* Contenu */}
          <div className="flex flex-col gap-5 px-4 pb-24 lg:pb-10">
            <Composer />
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        <RightRail />
      </div>

      <MobileNav />
    </div>
  );
}
