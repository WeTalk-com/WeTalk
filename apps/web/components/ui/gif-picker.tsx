"use client";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
import { searchGifs, gifToFile, type Gif } from "@/lib/api/giphy";
import { IconButton } from "./icon-button";

function GifGrid({ onPick }: { onPick: (file: File) => void }) {
  const t = useTranslations("app.create");
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);

  // Recherche débouncée (tendances si vide).
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      searchGifs(query)
        .then(setGifs)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  async function pick(gif: Gif) {
    if (picking) return;
    setPicking(true);
    try {
      onPick(await gifToFile(gif));
    } finally {
      setPicking(false);
    }
  }

  return (
    <div className="flex h-96 w-80 flex-col rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown-sec" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("gifSearch")}
          className="w-full rounded-full border border-border bg-canvas py-2 pl-9 pr-3 text-sm text-brown outline-none placeholder:text-placeholder"
        />
      </div>
      <div className="relative flex-1 overflow-y-auto">
        {(loading || picking) && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-card/60">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        )}
        <div className="columns-2 gap-2">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => pick(gif)}
              className="mb-2 block w-full overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gif.previewUrl} alt={gif.title} className="w-full" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bouton GIF + popover de recherche Giphy. */
export function GifPicker({ onSelect, label }: { onSelect: (file: File) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <IconButton label={label}>
          <span className="text-[11px] font-extrabold tracking-tight">GIF</span>
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="start" sideOffset={8} className="z-50">
          <GifGrid
            onPick={(file) => {
              onSelect(file);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
