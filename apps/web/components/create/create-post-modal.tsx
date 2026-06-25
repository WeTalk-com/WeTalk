"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ImageIcon, Film, Sparkles } from "lucide-react";
import type { User } from "@/lib/types";
import { createPost } from "@/lib/api";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast-provider";
import { MentionDropdown } from "@/components/ui/mention-dropdown";
import { useMentionAutocomplete } from "@/lib/use-mention-autocomplete";
import { EmojiPicker } from "@/components/ui/emoji-picker";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const { users, mention, loading, update, insertMention, clear } =
    useMentionAutocomplete();
  const t = useTranslations("app.create");
  const router = useRouter();

  const toast = useToast();
  const remaining = MAX_CHARS - text.length;
  const tags = parseTags(text);
  const canPost = text.trim().length > 0 && remaining >= 0;

  function handleClose() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    onClose();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    removeVideo();
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    removeImage();
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    if (imageRef.current) imageRef.current.value = "";
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(null);
    setVideoPreview(null);
    if (videoRef.current) videoRef.current.value = "";
  }

  // Insère l'emoji choisi à la position du curseur dans le textarea.
  function insertEmoji(native: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + native + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      if (el) {
        const pos = start + native.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }

  async function handlePost() {
    setPending(true);
    try {
      await createPost({ text, tags, image: image ?? undefined, video: video ?? undefined });
      onClose();
      toast.success(t("toastSuccess"));
      router.refresh();
    } catch {
      toast.error(t("toastError"));
    } finally {
      setPending(false);
    }
  }

  const _hasMedia = imagePreview || videoPreview;

  return (
    <Dialog.Root open onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-lg rounded-card border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <Dialog.Title className="font-head text-xl font-extrabold text-brown">
            {t("title")}
          </Dialog.Title>
          <Dialog.Close asChild>
            <IconButton label={t("close")}>
              <X className="size-5" />
            </IconButton>
          </Dialog.Close>
        </div>

        <div className="relative mt-4 flex gap-3">
          <Avatar initial={user.initial} src={user.avatarUrl} solid />
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                update(e.target.value, e.target.selectionStart);
              }}
              onKeyDown={(e) => {
                if (mention && users.length > 0 && e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const el = textareaRef.current;
                  if (el) {
                    const next = insertMention(users[0]?.username ?? "", text, el.selectionStart);
                    setText(next);
                    clear();
                  }
                }
                if (mention && e.key === "Escape") clear();
              }}
              onClick={() => {
                const el = textareaRef.current;
                if (el) update(text, el.selectionStart);
              }}
              onKeyUp={() => {
                const el = textareaRef.current;
                if (el) update(text, el.selectionStart);
              }}
              placeholder={t("placeholder")}
              rows={4}
              maxLength={MAX_CHARS + 20}
              className="min-h-28 w-full resize-none bg-transparent text-lg text-brown outline-none placeholder:text-placeholder"
            />
            <MentionDropdown
              users={users}
              loading={loading}
              mention={mention}
              onSelect={(username) => {
                const el = textareaRef.current;
                if (el) {
                  const next = insertMention(username, text, el.selectionStart);
                  setText(next);
                  clear();
                  el.focus();
                }
              }}
            />
          </div>
        </div>

        {/* Aperçu image */}
        {imagePreview && (
          <div className="relative mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt={t("imagePreviewAlt")}
              className="max-h-64 w-full rounded-2xl object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label={t("removeImage")}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-dark/70 text-canvas backdrop-blur-sm transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Aperçu vidéo */}
        {videoPreview && (
          <div className="relative mt-3">
            <video
              src={videoPreview}
              controls
              className="max-h-64 w-full rounded-2xl object-cover"
            />
            <button
              type="button"
              onClick={removeVideo}
              aria-label={t("removeVideo")}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-dark/70 text-canvas backdrop-blur-sm transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Inputs fichiers cachés */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoChange}
        />

        {/* Barre d'actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border pt-4">
          <IconButton label={t("addImage")} onClick={() => imageRef.current?.click()}>
            <ImageIcon className="size-5" />
          </IconButton>
          <IconButton label={t("addVideo")} onClick={() => videoRef.current?.click()}>
            <Film className="size-5" />
          </IconButton>
          <EmojiPicker onSelect={insertEmoji} label={t("addEmoji")} />
<IconButton label={t("enhance")}>
            <Sparkles className="size-5" />
          </IconButton>

          {/* Compteur de caractères */}
          <span
            className={cn(
              "ml-auto mr-3 text-sm font-medium tabular-nums",
              remaining < 0 ? "text-live" : remaining <= 20 ? "text-gold" : "text-brown-sec",
            )}
          >
            {remaining}
          </span>

          <Button disabled={!canPost || pending} onClick={handlePost}>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
