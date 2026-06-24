"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Heart, CornerDownRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { Comment, Reply } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { MentionDropdown } from "@/components/ui/mention-dropdown";
import { MentionText } from "@/components/ui/mention-text";
import { useMentionAutocomplete } from "@/lib/use-mention-autocomplete";
import { createComment, createReply, likeComment, unlikeComment } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";

// Bouton like d'un commentaire/réponse : optimiste, recalé sur la réponse serveur,
// rollback si erreur. Même logique que PostActions.
function CommentLike({
  commentId,
  likes,
  likedByMe,
  iconClass,
}: {
  commentId: string;
  likes: number;
  likedByMe?: boolean;
  iconClass: string;
}) {
  const [liked, setLiked] = useState(Boolean(likedByMe));
  const [count, setCount] = useState(likes);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const s = next ? await likeComment(commentId) : await unlikeComment(commentId);
      setLiked(s.likedByMe);
      setCount(s.likeCount);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-live" : "text-brown-sec hover:text-live"}`}
    >
      <Heart className={`${iconClass} ${liked ? "fill-live" : ""}`} />
      {count}
    </button>
  );
}

function ReplyRow({ reply }: { reply: Reply }) {
  // Langue active, pour formater la date relative de la reponse.
  const locale = useLocale();
  return (
    <div className="ml-11 mt-2 flex gap-2.5">
      <Avatar initial={reply.author.initial} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brown">
          {reply.author.name}{" "}
          <span className="font-normal text-brown-sec">@{reply.author.handle} · {formatTimeAgo(reply.createdAt, locale)}</span>
        </p>
        <p className="mt-0.5 text-sm text-ink"><MentionText text={reply.text} /></p>
        <div className="mt-1">
          <CommentLike
            commentId={reply.id}
            likes={reply.likes}
            likedByMe={reply.likedByMe}
            iconClass="size-3"
          />
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (id: string) => void;
}) {
  const t = useTranslations("app.comments");
  // Langue active, pour formater la date relative du commentaire.
  const locale = useLocale();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex gap-3">
        <Avatar initial={comment.author.initial} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brown">
            {comment.author.name}{" "}
            <span className="font-normal text-brown-sec">
              @{comment.author.handle} · {formatTimeAgo(comment.createdAt, locale)}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-ink"><MentionText text={comment.text} /></p>

          <div className="mt-2 flex items-center gap-4">
            <CommentLike
              commentId={comment.id}
              likes={comment.likes}
              likedByMe={comment.likedByMe}
              iconClass="size-3.5"
            />

            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-brown-sec transition-colors hover:text-brown"
            >
              <CornerDownRight className="size-3.5" />
              {t("reply")}
            </button>

            {comment.replies.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="ml-auto flex items-center gap-1 text-xs text-gold hover:underline"
              >
                {showReplies ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? t("reply") : t("replies")}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplies &&
        comment.replies.map((r) => <ReplyRow key={r.id} reply={r} />)}
    </div>
  );
}

export function CommentThread({
  postId,
  initialComments,
  loading,
  onClose,
  onCommentAdded,
}: {
  postId: string;
  initialComments: Comment[];
  loading?: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}) {
  const t = useTranslations("app.comments");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { users, mention, loading: mentionLoading, update, insertMention, clear } = useMentionAutocomplete();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const cursorRef = useRef<number | null>(null);

  useEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.selectionStart = cursorRef.current;
      inputRef.current.selectionEnd = cursorRef.current;
      cursorRef.current = null;
    }
  });

  // La modale s'ouvre avant la fin du fetch : resynchroniser l'état interne
  // quand les commentaires chargés arrivent (un useState(prop) ne suit pas le prop).
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setSelectedIdx(0);
    update(val, e.target.selectionStart ?? 0);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mention && users.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % users.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + users.length) % users.length);
        return;
      }
      if (e.key === "Enter" && users[selectedIdx]) {
        e.preventDefault();
        handleMentionSelect(users[selectedIdx].username);
        return;
      }
      if (e.key === "Escape") {
        clear();
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleMentionSelect(username: string) {
    const idx = inputRef.current?.selectionStart ?? input.length;
    const next = insertMention(username, input, idx);
    setInput(next);
    cursorRef.current = (mention?.start ?? 0) + username.length + 1;
    clear();
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text || pending) return;
    setPending(true);
    try {
      if (replyingTo) {
        const reply = await createReply(postId, replyingTo, text);
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo ? { ...c, replies: [...c.replies, reply] } : c,
          ),
        );
        setReplyingTo(null);
      } else {
        const comment = await createComment(postId, text);
        setComments((prev) => [...prev, comment]);
      }
      onCommentAdded?.();
      setInput("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-dark/50 backdrop-blur-sm p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-card border border-border bg-card shadow-card"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-head text-lg font-bold text-brown">
            {t("title")} ({comments.length})
          </h2>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-brown-sec hover:bg-card"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto px-5">
          {loading && comments.length === 0 ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="size-5 animate-spin text-brown-sec" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                onReply={(id) => {
                  setReplyingTo(id);
                  setInput("");
                }}
              />
            ))
          ) : (
            <p className="py-12 text-center text-sm text-brown-sec">
              {t("empty")}
            </p>
          )}
        </div>

        {/* Champ de saisie */}
        <div className="shrink-0 border-t border-border px-5 py-4">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 text-xs text-brown-sec">
              <CornerDownRight className="size-3" />
              <span>{t("replyingTo")}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gold hover:underline"
              >
                {t("cancel")}
              </button>
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={replyingTo ? t("replyPlaceholder") : t("placeholder")}
                className="w-full rounded-full border border-border bg-canvas px-4 py-2 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
              />
              <MentionDropdown
                users={users}
                loading={mentionLoading}
                mention={mention}
                onSelect={handleMentionSelect}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || pending}
              className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              {t("send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
