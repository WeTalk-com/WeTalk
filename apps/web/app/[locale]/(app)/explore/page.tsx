import type { Metadata } from "next";
import { TopBar } from "@/app/_components/layout/top-bar";
import { ExploreFilters } from "@/app/_components/explore/explore-filters";
import { ExploreTile } from "@/app/_components/explore/explore-tile";
import { exploreTiles } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Explore · WeTalk",
};

export default function ExplorePage() {
  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder="Search golden hours, people, tags…" />

      <div className="px-5 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">Explore</h1>
        <ExploreFilters />
      </div>

      {/* Grille masonry */}
      <div className="columns-2 gap-3 px-4 pb-24 pt-4 md:columns-3 lg:pb-10">
        {exploreTiles.map((tile) => (
          <ExploreTile key={tile.id} tile={tile} />
        ))}
      </div>
    </main>
  );
}
