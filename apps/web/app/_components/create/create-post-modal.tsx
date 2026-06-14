"use client";

import { useEffect, useState } from "react";
import { X, ImageIcon, Smile, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { currentUser } from "@/lib/mock-data";

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");

  // Fermeture clavier (Echap) + blocage du scroll de fond
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handlePost() {
    // Maquette : pas de backend
    console.log("new post", text);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-dark/50 p-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create a post"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-card border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-head text-xl font-extrabold text-brown">
            New post
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>

        <div className="mt-4 flex gap-3">
          <Avatar initial={currentUser.initial} solid />
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something warm…"
            rows={4}
            className="min-h-28 flex-1 resize-none bg-transparent text-lg text-brown outline-none placeholder:text-placeholder"
          />
        </div>

        {/* Zone image (placeholder design) */}
        <div className="mt-3 grid aspect-16/10 place-items-center rounded-2xl border border-dashed border-border bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(186,117,23,0.10)_12px,rgba(186,117,23,0.10)_24px)]">
          <span className="flex flex-col items-center gap-1 text-sm text-brown-sec">
            <ImageIcon className="size-6" />
            Add a photo
          </span>
        </div>

        {/* Barre d'actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border pt-4">
          <IconButton label="Add image">
            <ImageIcon className="size-5" />
          </IconButton>
          <IconButton label="Add emoji">
            <Smile className="size-5" />
          </IconButton>
          <IconButton label="Add location">
            <MapPin className="size-5" />
          </IconButton>
          <IconButton label="Enhance">
            <Sparkles className="size-5" />
          </IconButton>
          <Button
            className="ml-auto"
            disabled={!text.trim()}
            onClick={handlePost}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
