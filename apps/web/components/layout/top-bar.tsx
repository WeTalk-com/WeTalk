import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

/** Barre superieure de l'app : recherche (sticky). */
export function TopBar({ searchPlaceholder }: { searchPlaceholder?: string }) {
  const t = useTranslations("app.topBar");
  const placeholder = searchPlaceholder ?? t("searchPlaceholder");

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-brown-sec focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
        <Search className="size-5 shrink-0" />
        <input
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
        />
      </div>
    </div>
  );
}
