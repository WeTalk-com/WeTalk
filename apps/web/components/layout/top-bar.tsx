"use client";

import { Suspense, useCallback, useEffect, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type Props = {
  searchPlaceholder?: string;
  /** Active la recherche par URL (?q=…). Utiliser sur la page Explore uniquement. */
  searchable?: boolean;
};

/** Input connecté aux searchParams — isolé pour permettre le Suspense. */
function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = searchParams.get("q") ?? "";

  const handleChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}` as never);
        });
      }, 300);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <input
      type="search"
      placeholder={placeholder}
      aria-label={placeholder}
      defaultValue={query}
      onChange={(e) => handleChange(e.target.value)}
      className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
    />
  );
}

/** Barre supérieure de l'app : recherche (sticky). */
export function TopBar({ searchPlaceholder, searchable = false }: Props) {
  const t = useTranslations("app.topBar");
  const placeholder = searchPlaceholder ?? t("searchPlaceholder");

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-brown-sec focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
        <Search className="size-5 shrink-0" />
        {searchable ? (
          <Suspense
            fallback={
              <input
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
              />
            }
          >
            <SearchInput placeholder={placeholder} />
          </Suspense>
        ) : (
          <input
            type="search"
            placeholder={placeholder}
            aria-label={placeholder}
            readOnly
            className="min-w-0 flex-1 bg-transparent text-brown outline-none placeholder:text-placeholder"
          />
        )}
      </div>
    </div>
  );
}
