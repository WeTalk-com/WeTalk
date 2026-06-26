"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { User } from "@/lib/types";
import { createPost } from "@/lib/api";
import { Avatar } from "../ui/avatar";
import { useToast } from "@/components/ui/toast-provider";
import { MentionDropdown } from "@/components/ui/mention-dropdown";
import { useMentionAutocomplete } from "@/lib/use-mention-autocomplete";
import { cn } from "@/lib/cn";

const MAX_CHARS = 280;

/** Extrait les #hashtags d'un texte brut. */
function parseTags(text: string): string[] {
  const matches = text.match(/#[\wÀ-ſ]+/g) ?? [];
  return [...new Set(matches)];
}

/** Composer inline en tête du feed (carte blanche, calqué sur le mockup). */
export function HomeComposer({ user }: { user: User }) {
  const t = useTranslations("app.create");
  const router = useRouter();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { users, mention, loading, update, insertMention, clear } =
    useMentionAutocomplete();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0 && !pending;

  // Insère la @mention choisie à la position du curseur.
  function pickMention(username: string) {
    const el = textareaRef.current;
    if (!el) return;
    setText(insertMention(username, text, el.selectionStart));
    clear();
    el.focus();
  }

  async function publish() {
    if (!canPost) return;
    setPending(true);
    try {
      await createPost({ text, tags: parseTags(text) });
      setText("");
      toast.success(t("toastSuccess"));
      router.refresh();
    } catch {
      toast.error(t("toastError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-[26px] flex gap-[14px] rounded-[26px] bg-card p-[18px_22px] shadow-post">
      <Avatar initial={user.initial} src={user.avatarUrl} size={44} solid />
      <div className="relative min-w-0 flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value.slice(0, MAX_CHARS));
            update(e.target.value, e.target.selectionStart);
          }}
          onKeyDown={(e) => {
            if (mention && users.length > 0 && e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              pickMention(users[0]?.username ?? "");
            }
            if (mention && e.key === "Escape") clear();
          }}
          onClick={() => update(text, textareaRef.current?.selectionStart ?? 0)}
          onKeyUp={() => update(text, textareaRef.current?.selectionStart ?? 0)}
          placeholder={t("placeholder")}
          rows={1}
          className="w-full resize-none bg-transparent pt-2 text-lg leading-normal text-brown outline-none placeholder:text-placeholder"
        />
        <MentionDropdown
          users={users}
          loading={loading}
          mention={mention}
          onSelect={pickMention}
        />
        <div className="mt-2 flex items-center justify-end gap-4">
          <span className="text-sm tabular-nums text-placeholder">{remaining}</span>
          <button
            type="button"
            onClick={publish}
            disabled={!canPost}
            className={cn(
              "rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]",
              !canPost && "opacity-50",
            )}
          >
            {t("post")}
          </button>
        </div>
      </div>
    </div>
  );
}
