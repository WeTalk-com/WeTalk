"use client";

import { useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Conversation } from "@/lib/types";
import { sendMessage } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/icons/brand";
import { cn } from "@/lib/cn";

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-card",
        active ? "bg-card" : (conv.unread ?? 0) > 0 ? "bg-gold/5" : "",
      )}
    >
      <div className="relative shrink-0">
        <Avatar initial={conv.user.initial} size={44} />
        {(conv.unread ?? 0) > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white">
            {conv.unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 font-semibold text-brown truncate">
            {conv.user.name}
            {conv.user.verified && <VerifiedBadge className="size-4 shrink-0" />}
          </span>
          <span className="shrink-0 text-xs text-brown-sec">{formatTimeAgo(conv.lastMessageAt, locale)}</span>
        </div>
        <p className={cn("truncate text-sm", (conv.unread ?? 0) > 0 ? "font-medium text-brown" : "text-brown-sec")}>
          {conv.lastMessage}
        </p>
      </div>
    </button>
  );
}

export function MessagesLayout({ conversations }: { conversations: Conversation[] }) {
  const t = useTranslations("app.messages");
  const locale = useLocale();
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  function selectConv(conv: Conversation) {
    setSelected(conv);
    setMobileShowChat(true);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !selected) return;
    setInput("");
    const msg = await sendMessage(selected.id, text);
    setSelected((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, msg], lastMessage: text }
        : prev,
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Liste des conversations */}
      <div
        className={cn("flex w-full flex-col border-r border-border lg:w-85 lg:shrink-0", mobileShowChat ? "hidden lg:flex" : "flex")}
      >
        <div className="border-b border-border px-5 py-4">
          <h1 className="font-display text-2xl font-bold text-brown">{t("title")}</h1>
        </div>
        <ScrollArea.Root className="flex-1 min-h-0">
          <ScrollArea.Viewport className="h-full">
            <ul className="pb-24 lg:pb-0">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <ConversationRow
                    conv={conv}
                    active={selected?.id === conv.id}
                    onClick={() => selectConv(conv)}
                  />
                </li>
              ))}
            </ul>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            className="flex w-1.5 touch-none select-none p-px transition-colors"
          >
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>

      {/* Zone de chat */}
      <div
        className={cn("flex min-w-0 flex-1 flex-col", mobileShowChat ? "flex" : "hidden lg:flex")}
      >
        {selected ? (
          <>
            {/* Header chat */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                type="button"
                aria-label={t("back")}
                onClick={() => setMobileShowChat(false)}
                className="lg:hidden shrink-0 rounded-full p-1.5 text-brown-sec hover:bg-card"
              >
                <ArrowLeft className="size-5" />
              </button>
              <Avatar initial={selected.user.initial} size={36} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 font-semibold text-brown leading-tight">
                  {selected.user.name}
                  {selected.user.verified && <VerifiedBadge className="size-4 shrink-0" />}
                </p>
                <p className="text-xs text-brown-sec">@{selected.user.handle}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea.Root className="flex flex-1 min-h-0">
              <ScrollArea.Viewport className="h-full">
                <div className="flex flex-col gap-3 px-4 py-4 pb-4">
                  {selected.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          msg.mine ? "rounded-br-sm bg-gold text-white" : "rounded-bl-sm bg-card text-brown",
                        )}
                      >
                        {msg.text}
                        <span className={cn("mt-1 block text-[10px]", msg.mine ? "text-white/70" : "text-brown-sec")}>
                          {formatTimeAgo(msg.createdAt, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="vertical"
                className="flex w-1.5 touch-none select-none p-px transition-colors"
              >
                <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {/* Input */}
            <div className="flex items-center gap-3 border-t border-border px-4 py-3 pb-28 lg:pb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder={t("typeMessage")}
                className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
              />
              <button
                type="button"
                aria-label={t("send")}
                disabled={!input.trim()}
                onClick={handleSend}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-white transition-opacity disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
            <div className="grid size-16 place-items-center rounded-full bg-gold/10">
              <Send className="size-7 text-gold" />
            </div>
            <p className="font-semibold text-brown">{t("noConversationSelected")}</p>
            <p className="text-sm text-brown-sec">{t("selectConversation")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
