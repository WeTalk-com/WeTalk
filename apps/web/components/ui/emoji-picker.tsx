"use client";

import { useEffect, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Smile } from "lucide-react";
import data from "@emoji-mart/data";
import { Picker } from "emoji-mart";
import { IconButton } from "./icon-button";

// Monte le Picker vanilla emoji-mart (set Apple) dans un conteneur React.
function PickerMount({ onSelect }: { onSelect: (native: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Callback dans une ref : le picker n'est monté qu'une fois, sans dépendre de onSelect.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const picker = new Picker({
      data,
      set: "native", // emojis natifs de l'OS : pas de chargement d'images (évite les "#").
      theme: "light",
      locale: "fr",
      previewPosition: "none",
      skinTonePosition: "search",
      onEmojiSelect: (e: { native: string }) => onSelectRef.current(e.native),
    });
    const el = ref.current;
    el?.appendChild(picker as unknown as Node);
    return () => {
      el?.replaceChildren();
    };
  }, []);

  return <div ref={ref} />;
}

/** Bouton emoji + popover du sélecteur (artwork Apple). */
export function EmojiPicker({ onSelect, label }: { onSelect: (native: string) => void; label: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton label={label}>
          <Smile className="size-5" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="start" sideOffset={8} className="z-50">
          <PickerMount onSelect={onSelect} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
