"use client";

import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Dialog from "@radix-ui/react-dialog";
import { Send, ArrowLeft, Loader2, SquarePen, Search, X, Smile } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Conversation, Message, User } from "@/lib/types";
import { sendMessage, getConversationMessages, markConversationRead, searchUsers, getLatestFollowing } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/icons/brand";
import { cn } from "@/lib/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessagePosition = "single" | "first" | "middle" | "last";

type RenderItem =
  | { type: "separator"; key: string; label: string }
  | { type: "group"; key: string; mine: boolean; messages: Message[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDay(
  iso: string,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
): string {
  const date = new Date(iso);
  const now = new Date();
  const key = dayKey(iso);
  if (key === dayKey(now.toISOString())) return todayLabel;
  if (key === dayKey(new Date(now.getTime() - 86_400_000).toISOString())) return yesterdayLabel;
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

function formatMessageTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Aperçu de conversation : 4 mots max + ellipse (l'ellipsis CSS gère le reste).
function teaser(text: string, maxWords = 4): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : `${words.slice(0, maxWords).join(" ")}…`;
}

function buildRenderItems(
  messages: Message[],
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
): RenderItem[] {
  const items: RenderItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg) continue;
    const prev = i > 0 ? messages[i - 1] : undefined;
    // Insert date separator on calendar day change.
    if (!prev || dayKey(msg.createdAt) !== dayKey(prev.createdAt)) {
      items.push({
        type: "separator",
        key: `sep-${i}`,
        label: formatDay(msg.createdAt, locale, todayLabel, yesterdayLabel),
      });
    }
    // Group with previous if same sender, same day, within 5 min.
    const timeDiff = prev
      ? (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) / 60_000
      : Infinity;
    const canGroup =
      prev !== undefined &&
      prev.mine === msg.mine &&
      timeDiff < 5 &&
      dayKey(msg.createdAt) === dayKey(prev.createdAt);
    if (canGroup) {
      const last = items[items.length - 1];
      if (last && last.type === "group") {
        last.messages.push(msg);
        last.key = msg.id;
        continue;
      }
    }
    items.push({ type: "group", key: msg.id, mine: msg.mine, messages: [msg] });
  }
  return items;
}

// Tail at the TOP corner of the first message in a group (WhatsApp style).
function bubbleRadius(mine: boolean, position: MessagePosition): string {
  if (mine) {
    if (position === "single" || position === "first") return "rounded-2xl rounded-tr-sm";
    if (position === "middle") return "rounded-2xl rounded-r-sm";
    return "rounded-2xl";
  }
  if (position === "single" || position === "first") return "rounded-2xl rounded-tl-sm";
  if (position === "middle") return "rounded-2xl rounded-l-sm";
  return "rounded-2xl";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-3">
      <span className="rounded-full bg-border/80 px-3.5 py-1 text-[11px] font-medium text-brown-sec">
        {label}
      </span>
    </div>
  );
}

function MessageGroup({
  mine,
  messages,
  locale,
}: {
  mine: boolean;
  messages: Message[];
  locale: string;
}) {
  const total = messages.length;
  return (
    <div className={cn("flex w-full flex-col gap-0.5", mine ? "items-end" : "items-start")}>
      {messages.map((msg, i) => {
        const position: MessagePosition =
          total === 1 ? "single" : i === 0 ? "first" : i === total - 1 ? "last" : "middle";
        return (
          <div
            key={msg.id}
            className={cn(
              "flex min-w-14 max-w-[75%] flex-col overflow-hidden px-3.5 py-2 text-sm",
              bubbleRadius(mine, position),
              mine ? "bg-gold text-white" : "bg-cream text-brown",
            )}
          >
            <span className="break-words [overflow-wrap:anywhere] leading-[1.45]">{msg.text}</span>
            <span
              className={cn(
                "mt-0.5 self-end text-[10px]",
                mine ? "text-white/55" : "text-brown-sec",
              )}
            >
              {formatMessageTime(msg.createdAt, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        active ? "bg-card" : (conv.unread ?? 0) > 0 ? "bg-gold/5" : "hover:bg-canvas/50",
      )}
    >
      <div className="relative shrink-0">
        <Avatar initial={conv.user.initial} src={conv.user.avatarUrl} size={44} />
        {(conv.unread ?? 0) > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white">
            {conv.unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 font-semibold text-brown">
            <span className="truncate">{conv.user.name}</span>
            {conv.user.verified && <VerifiedBadge className="size-4 shrink-0" />}
          </span>
          <span className="shrink-0 text-xs text-brown-sec">
            {formatTimeAgo(conv.lastMessageAt, locale)}
          </span>
        </div>
        <p
          className={cn(
            "truncate text-sm",
            (conv.unread ?? 0) > 0 ? "font-medium text-brown" : "text-brown-sec",
          )}
        >
          {teaser(conv.lastMessage)}
        </p>
      </div>
    </button>
  );
}

function UserRow({ user, onSelect }: { user: User; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas"
      >
        <Avatar initial={user.initial} src={user.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 font-semibold text-brown">
            <span className="truncate">{user.name}</span>
            {user.verified && <VerifiedBadge className="size-4 shrink-0" />}
          </p>
          <p className="truncate text-sm text-brown-sec">@{user.handle}</p>
        </div>
      </button>
    </li>
  );
}

function ComposeModal({
  open,
  onClose,
  onSelectUser,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUserId?: string;
}) {
  const t = useTranslations("app.messages");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Suggestions par défaut : les 5 derniers comptes suivis (chargés à l'ouverture).
  useEffect(() => {
    if (!open || !currentUserId) {
     setSuggestions([]);
     return;
    }
    let cancelled = false;
    getLatestFollowing(currentUserId)
      .then((users) => { if (!cancelled) setSuggestions(users); })
      .catch(() => { if (!cancelled) setSuggestions([]); });
    return () => { cancelled = true; };
  }, [open, currentUserId]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(value.trim());
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleClose() {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v: boolean) => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-card shadow-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Dialog.Close
                aria-label={t("composeClose")}
                className="grid size-8 place-items-center rounded-full text-brown-sec hover:bg-canvas"
                onClick={handleClose}
              >
                <X className="size-4" />
              </Dialog.Close>
              <Dialog.Title className="font-head text-base font-bold text-brown">
                {t("compose")}
              </Dialog.Title>
            </div>

            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="size-4 shrink-0 text-brown-sec" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={t("composePlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-sm text-brown outline-none placeholder:text-placeholder"
              />
              {searching && <Loader2 className="size-4 animate-spin text-brown-sec" />}
            </div>

            <ul className="max-h-72 overflow-y-auto">
              {query.trim() ? (
                results.length === 0 && !searching ? (
                  <li className="py-8 text-center text-sm text-brown-sec">
                    {t("composeNoResults")}
                  </li>
                ) : (
                  results.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onSelect={() => { onSelectUser(u); handleClose(); }}
                    />
                  ))
                )
              ) : (
                suggestions.length > 0 && (
                  <>
                    <li className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-brown-sec">
                      {t("composeSuggestions")}
                    </li>
                    {suggestions.map((u) => (
                      <UserRow
                        key={u.id}
                        user={u}
                        onSelect={() => { onSelectUser(u); handleClose(); }}
                      />
                    ))}
                  </>
                )
              )}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export function MessagesLayout({
  conversations: initial,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId?: string;
}) {
  const t = useTranslations("app.messages");
  const locale = useLocale();
  const [conversations, setConversations] = useState(initial);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const selectedRef = useRef<Conversation | null>(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  // Real-time incoming messages via Socket.io.
  useEffect(() => {
    const socket = io({ path: "/api/socket.io/messages/", withCredentials: true });

    socket.on(
      "receive_private_message",
      (data: { _id: string; senderId: string; content: string; createdAt: string }) => {
        const msg: Message = {
          id: data._id,
          text: data.content,
          createdAt: data.createdAt,
          mine: false,
        };
        setSelected((prev) =>
          prev?.id === data.senderId ? { ...prev, messages: [...prev.messages, msg] } : prev,
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === data.senderId
              ? {
                  ...c,
                  lastMessage: data.content,
                  lastMessageAt: data.createdAt,
                  unread:
                    selectedRef.current?.id === data.senderId ? 0 : (c.unread ?? 0) + 1,
                }
              : c,
          ),
        );
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  async function selectConv(conv: Conversation) {
    setSelected({ ...conv, messages: [] });
    setMobileShowChat(true);
    setLoadingMessages(true);
    try {
      const messages = await getConversationMessages(conv.id);
      setSelected((prev) => (prev ? { ...prev, messages } : prev));
      if ((conv.unread ?? 0) > 0) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
        );
        void markConversationRead(conv.id).catch(() => {});
      }
    } catch {
      // messages stay empty
    } finally {
      setLoadingMessages(false);
    }
  }

  function handleSelectUser(user: User) {
    const existing = conversations.find((c) => c.id === user.id);
    if (existing) {
      void selectConv(existing);
      return;
    }
    const newConv: Conversation = {
      id: user.id,
      user,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    void selectConv(newConv);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !selected) return;
    setInput("");
    try {
      const msg = await sendMessage(selected.id, text);
      setSelected((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg], lastMessage: text } : prev,
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, lastMessage: text, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
    } catch {
      setInput(text);
    }
  }

  return (
    <>
      <ComposeModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        onSelectUser={handleSelectUser}
        currentUserId={currentUserId}
      />

      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <div
          className={cn(
            "flex w-full flex-col border-r border-brown-sec/20 lg:w-85 lg:shrink-0",
            mobileShowChat ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-brown-sec/20 px-5 pb-4 pt-6">
            <h1 className="font-display text-3xl font-bold text-brown">{t("title")}</h1>
            <button
              type="button"
              aria-label={t("compose")}
              onClick={() => setShowCompose(true)}
              className="grid size-9 place-items-center rounded-full text-brown-sec transition-colors hover:bg-canvas hover:text-brown"
            >
              <SquarePen className="size-5" />
            </button>
          </div>
          <ScrollArea.Root className="min-h-0 flex-1">
            <ScrollArea.Viewport className="h-full">
              <ul className="pb-24 lg:pb-0">
                {conversations.length === 0 ? (
                  <li className="py-12 text-center text-sm text-brown-sec">
                    {t("noConversations")}
                  </li>
                ) : (
                  conversations.map((conv) => (
                    <li key={conv.id}>
                      <ConversationRow
                        conv={conv}
                        active={selected?.id === conv.id}
                        onClick={() => void selectConv(conv)}
                      />
                    </li>
                  ))
                )}
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

        {/* Chat area */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            mobileShowChat ? "flex" : "hidden lg:flex",
          )}
        >
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-brown-sec/20 px-4 py-3">
                <button
                  type="button"
                  aria-label={t("back")}
                  onClick={() => setMobileShowChat(false)}
                  className="lg:hidden shrink-0 rounded-full p-1.5 text-brown-sec"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <Link
                  href={{ pathname: "/profile/[handle]", params: { handle: selected.user.handle } }}
                  className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <Avatar initial={selected.user.initial} src={selected.user.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate font-semibold leading-tight text-brown">
                      <span className="truncate">{selected.user.name}</span>
                      {selected.user.verified && <VerifiedBadge className="size-4 shrink-0" />}
                    </p>
                    <p className="truncate text-xs text-brown-sec">@{selected.user.handle}</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <ScrollArea.Root className="flex min-h-0 flex-1">
                <ScrollArea.Viewport className="h-full w-full">
                  <div className="flex w-full flex-col gap-2 px-4 py-5">
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-brown-sec" />
                      </div>
                    ) : selected.messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-brown-sec">{t("empty")}</p>
                    ) : (
                      buildRenderItems(
                        selected.messages,
                        locale,
                        t("today"),
                        t("yesterday"),
                      ).map((item) =>
                        item.type === "separator" ? (
                          <DateSeparator key={item.key} label={item.label} />
                        ) : (
                          <MessageGroup
                            key={item.key}
                            mine={item.mine}
                            messages={item.messages}
                            locale={locale}
                          />
                        ),
                      )
                    )}
                    <div ref={messagesEndRef} />
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
              <div className="flex items-center gap-2 border-t border-brown-sec/20 px-3 py-3 pb-28 lg:pb-3">
                <button
                  type="button"
                  aria-label="Emoji"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-brown-sec transition-colors hover:bg-canvas hover:text-brown"
                >
                  <Smile className="size-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSend();
                  }}
                  placeholder={t("typeMessage")}
                  className="min-w-0 flex-1 rounded-full border border-border bg-canvas px-4 py-2.5 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
                />
                <button
                  type="button"
                  aria-label={t("send")}
                  disabled={!input.trim()}
                  onClick={() => void handleSend()}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-gold/10">
                <Send className="size-7 text-gold" />
              </div>
              <p className="font-semibold text-brown">{t("noConversationSelected")}</p>
              <p className="text-sm text-brown-sec">{t("selectConversation")}</p>
              <button
                type="button"
                onClick={() => setShowCompose(true)}
                className="mt-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("compose")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
