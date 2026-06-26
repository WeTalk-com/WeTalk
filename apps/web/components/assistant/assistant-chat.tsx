"use client";

import { useState, useRef, useEffect } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { sendChatMessage } from "@/lib/api";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  text: string;
  mine: boolean;
  error?: boolean;
};

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

// Avatar de l'assistant (étincelle dorée), repris du langage visuel WeTalk.
function BotAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gold/10 text-gold"
      style={{ width: size, height: size }}
    >
      <Sparkles className="size-5" />
    </span>
  );
}

// Bulle de message, même style que la messagerie (gold = moi, cream = assistant).
function Bubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className={cn("flex w-full", msg.mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-[1.45]",
          msg.mine
            ? "rounded-tr-sm bg-gold text-white"
            : msg.error
              ? "rounded-tl-sm bg-live/10 text-live"
              : "rounded-tl-sm bg-cream text-brown",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}

// Indicateur « l'assistant écrit… » : trois points animés dans une bulle.
function TypingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-cream px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-brown-sec/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AssistantChat() {
  const t = useTranslations("app.assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: newId(), text: trimmed, mine: true }]);
    setSending(true);
    try {
      const answer = await sendChatMessage(trimmed);
      setMessages((prev) => [...prev, { id: newId(), text: answer, mine: false }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: newId(), text: t("error"), mine: false, error: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  const suggestions = [t("suggestion1"), t("suggestion2"), t("suggestion3")];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <BotAvatar />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight text-brown">
            {t("title")}
          </h1>
          <p className="text-xs text-brown-sec">{t("subtitle")}</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea.Root className="flex min-h-0 flex-1">
        <ScrollArea.Viewport className="h-full w-full">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-gold/10">
                <Sparkles className="size-7 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-brown">{t("welcomeTitle")}</p>
                <p className="mt-1 text-sm text-brown-sec">{t("welcomeText")}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-brown transition-colors hover:border-gold hover:text-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-2.5 px-4 py-5">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
              {sending && <TypingBubble />}
              <div ref={endRef} />
            </div>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex w-1.5 touch-none select-none p-px transition-colors"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-3 pb-28 lg:pb-3">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send(input);
            }}
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 rounded-full border border-border bg-canvas px-4 py-2.5 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
          />
          <button
            type="button"
            aria-label={t("send")}
            disabled={!input.trim() || sending}
            onClick={() => void send(input)}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-white transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
