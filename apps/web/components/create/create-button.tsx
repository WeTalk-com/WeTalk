"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useCreateModal } from "./create-modal-provider";

/** Bouton d'ouverture de la modale de creation (2 variantes). */
export function CreateButton({ variant }: { variant: "sidebar" | "dock" }) {
  const { open } = useCreateModal();
  const t = useTranslations("nav");

  if (variant === "dock") {
    return (
      <button
        type="button"
        aria-label={t("create")}
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
      className="mx-1.5 mt-5 flex items-center justify-center gap-2 rounded-full bg-gold py-[15px] text-[17px] font-bold text-white shadow-gold transition-all active:scale-[0.98]"
    >
      <Plus className="size-[21px]" />
      {t("create")}
    </button>
  );
}
