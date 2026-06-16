"use client";

import { Plus } from "lucide-react";
import { useCreateModal } from "./create-modal-provider";

/** Bouton d'ouverture de la modale de creation (2 variantes). */
export function CreateButton({ variant }: { variant: "sidebar" | "dock" }) {
  const { open } = useCreateModal();

  if (variant === "dock") {
    return (
      <button
        type="button"
        aria-label="Create a post"
        onClick={open}
        className="grid size-12 place-items-center rounded-full bg-gold text-white shadow-gold transition-all active:scale-95"
      >
        <Plus className="size-6" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gold py-4 text-lg font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98]"
    >
      <Plus className="size-5" />
      Create
    </button>
  );
}
