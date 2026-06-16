import { Heart } from "lucide-react";
import type { ExploreTile as Tile } from "@/lib/types";

/** Tuile de la grille Explore (placeholder raye + overlay tag/likes). */
export function ExploreTile({ tile }: { tile: Tile }) {
  return (
    <div
      className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(186,117,23,0.10)_12px,rgba(186,117,23,0.10)_24px)]"
      style={{ height: tile.height }}
    >
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-dark/60 to-transparent p-3 text-white">
        <span className="text-sm font-semibold">{tile.tag}</span>
        <span className="flex items-center gap-1 text-xs">
          <Heart className="size-3.5" />
          {tile.likes}
        </span>
      </div>
    </div>
  );
}
