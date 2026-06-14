import { Search, Sparkles } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { ThemeToggle } from "../ui/theme-toggle";

/** Barre superieure de l'app : recherche + actions (sticky). */
export function TopBar({
  searchPlaceholder = "Search WeeTalk",
}: {
  searchPlaceholder?: string;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-brown-sec">
        <Search className="size-5 shrink-0" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
        />
      </div>
      <IconButton label="AI suggestions">
        <Sparkles className="size-5" />
      </IconButton>
      <ThemeToggle />
    </div>
  );
}
