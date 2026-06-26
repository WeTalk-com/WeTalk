"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { User } from "@/lib/types";
import { createPost } from "@/lib/api";
import { Avatar } from "../ui/avatar";
import { useToast } from "@/components/ui/toast-provider";
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
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0 && !pending;

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
      <div className="min-w-0 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={t("placeholder")}
          rows={1}
          className="w-full resize-none bg-transparent pt-2 text-lg leading-normal text-brown outline-none placeholder:text-placeholder"
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
