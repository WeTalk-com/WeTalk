"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, ImageIcon, Smile, MapPin, Sparkles } from "lucide-react";
import type { User } from "@/lib/types";
import { createPost } from "@/lib/api";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";

const MAX_CHARS = 280;

/** Extrait les #hashtags d'un texte brut. */
function parseTags(text: string): string[] {
  const matches = text.match(/#[\wÀ-ſ]+/g) ?? [];
  return [...new Set(matches)];
}

export function CreatePostModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("app.create");

  const remaining = MAX_CHARS - text.length;
  const tags = parseTags(text);
  const canPost = text.trim().length > 0 && remaining >= 0;

  // Fermeture clavier (Échap) + blocage du scroll de fond + nettoyage blob URL
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Révoquer l'URL blob si le modal se ferme avec une image chargée
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [onClose, preview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handlePost() {
    setPending(true);
    try {
      await createPost({ text, tags, image: image ?? undefined });
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center bg-dark/50 p-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-card border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-head text-xl font-extrabold text-brown">
            {t("title")}
          </h2>
          <IconButton label={t("close")} onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>

        <div className="mt-4 flex gap-3">
          <Avatar initial={user.initial} solid />
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            rows={4}
            maxLength={MAX_CHARS + 20}
            className="min-h-28 flex-1 resize-none bg-transparent text-lg text-brown outline-none placeholder:text-placeholder"
          />
        </div>

        {/* Aperçu image ou placeholder */}
        {preview ? (
          <div className="relative mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Aperçu"
              className="w-full rounded-2xl object-cover max-h-64"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label={t("removeImage")}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-dark/70 text-canvas backdrop-blur-sm transition-colors hover:bg-dark"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={t("addImage")}
            onClick={() => fileRef.current?.click()}
            className="mt-3 grid w-full aspect-16/10 cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(186,117,23,0.10)_12px,rgba(186,117,23,0.10)_24px)] transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            <span className="flex flex-col items-center gap-1 text-sm text-brown-sec">
              <ImageIcon className="size-6" />
              {t("addPhoto")}
            </span>
          </button>
        )}

        {/* Input fichier caché */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Barre d'actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border pt-4">
          <IconButton label={t("addImage")} onClick={() => fileRef.current?.click()}>
            <ImageIcon className="size-5" />
          </IconButton>
          <IconButton label={t("addEmoji")}>
            <Smile className="size-5" />
          </IconButton>
          <IconButton label={t("addLocation")}>
            <MapPin className="size-5" />
          </IconButton>
          <IconButton label={t("enhance")}>
            <Sparkles className="size-5" />
          </IconButton>

          {/* Compteur de caractères */}
          <span
            className={`ml-auto mr-3 text-sm font-medium tabular-nums ${
              remaining < 0
                ? "text-live"
                : remaining <= 20
                  ? "text-gold"
                  : "text-brown-sec"
            }`}
          >
            {remaining}
          </span>

          <Button
            disabled={!canPost || pending}
            onClick={handlePost}
          >
            {t("post")}
          </Button>
        </div>

        {/* Tags détectés */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
