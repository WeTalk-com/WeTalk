"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations, useLocale } from "next-intl";
import { X, Heart, CornerDownRight, ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import type { Comment, Reply } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { createComment, createReply, likeComment, unlikeComment, deleteComment } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";
import { useCurrentUserId } from "@/components/create/create-modal-provider";
import { cn } from "@/lib/cn";

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
      className={cn("flex items-center gap-1 text-xs transition-colors", liked ? "text-live" : "text-brown-sec hover:text-live")}
    >
      <Heart className={cn(iconClass, liked && "fill-live")} />
      {count}
    </button>
  );
}

function ReplyRow({
  reply,
  currentUserId,
  onDelete,
}: {
  reply: Reply;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("app.comments");
  const locale = useLocale();
  const isOwner = currentUserId === reply.author.id;

  async function handleDelete() {
    try {
      await deleteComment(reply.id);
      onDelete(reply.id);
    } catch {}
  }

  return (
    <div className="ml-11 mt-2 flex gap-2.5">
      <Avatar initial={reply.author.initial} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brown">
          {reply.author.name}{" "}
          <span className="font-normal text-brown-sec">@{reply.author.handle} · {formatTimeAgo(reply.createdAt, locale)}</span>
        </p>
        <p className="mt-0.5 text-sm text-ink">{reply.text}</p>
        <div className="mt-1 flex items-center gap-3">
          <CommentLike
            commentId={reply.id}
            likes={reply.likes}
            likedByMe={reply.likedByMe}
            iconClass="size-3"
          />
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-brown-sec transition-colors hover:text-live"
              aria-label={t("delete")}
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment;
  currentUserId: string;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("app.comments");
  const locale = useLocale();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies);
  const isOwner = currentUserId === comment.author.id;

  async function handleDelete() {
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch {}
  }

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
          <p className="mt-0.5 text-sm text-ink">{comment.text}</p>

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

            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-brown-sec transition-colors hover:text-live"
                aria-label={t("delete")}
              >
                <Trash2 className="size-3.5" />
              </button>
            )}

            {replies.length > 0 && (
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
                {replies.length}{" "}
                {replies.length === 1 ? t("reply") : t("replies")}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplies &&
        replies.map((r) => (
          <ReplyRow
            key={r.id}
            reply={r}
            currentUserId={currentUserId}
            onDelete={(id) => setReplies((prev) => prev.filter((x) => x.id !== id))}
          />
        ))}
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
  const currentUserId = useCurrentUserId();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  // La modale s'ouvre avant la fin du fetch : resynchroniser l'état interne
  // quand les commentaires chargés arrivent (un useState(prop) ne suit pas le prop).
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

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
    <Dialog.Root open onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-card border border-border bg-card shadow-card">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <Dialog.Title className="font-head text-lg font-bold text-brown">
                {t("title")} ({comments.length})
              </Dialog.Title>
              <Dialog.Close
                aria-label={t("close")}
                className="grid size-8 place-items-center rounded-full text-brown-sec hover:bg-card"
              >
                <X className="size-4" />
              </Dialog.Close>
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
                    currentUserId={currentUserId}
                    onReply={(id) => { setReplyingTo(id); setInput(""); }}
                    onDelete={(id) => setComments((prev) => prev.filter((x) => x.id !== id))}
                  />
                ))
              ) : (
                <p className="py-12 text-center text-sm text-brown-sec">{t("empty")}</p>
              )}
            </div>

            {/* Champ de saisie */}
            <div className="shrink-0 border-t border-border px-5 py-4">
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2 text-xs text-brown-sec">
                  <CornerDownRight className="size-3" />
                  <span>{t("replyingTo")}</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-gold hover:underline">
                    {t("cancel")}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder={replyingTo ? t("replyPlaceholder") : t("placeholder")}
                  className="min-w-0 flex-1 rounded-full border border-border bg-canvas px-4 py-2 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
                />
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
