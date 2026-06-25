"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Heart, CornerDownRight, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import type { Comment, Reply } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { createComment, createReply, deleteComment, updateComment, likeComment, unlikeComment } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";
import { useCurrentUser, useCurrentUserId } from "@/components/create/create-modal-provider";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast-provider";
import { useOptimisticLike } from "@/hooks/use-optimistic-like";

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
  const toast = useToast();
  const isOwner = currentUserId === reply.author.id;

  const { liked, count, toggle } = useOptimisticLike({
    initial: Boolean(reply.likedByMe),
    initialCount: reply.likes,
    onToggle: (next) => next ? likeComment(reply.id) : unlikeComment(reply.id),
  });

  const [text, setText] = useState(reply.text);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setEditText(text);
    setIsEditing(true);
  }

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === text) { setIsEditing(false); return; }
    setSaving(true);
    try {
      await updateComment(reply.id, trimmed);
      setText(trimmed);
      setIsEditing(false);
    } catch {
      toast.error(t("editError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteComment(reply.id);
      onDelete(reply.id);
    } catch {
      toast.error(t("deleteError"));
    }
  }

  return (
    <div className="ml-11 mt-2 flex gap-2.5">
      <Avatar initial={reply.author.initial} src={reply.author.avatarUrl} alt={reply.author.name} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brown">
          {reply.author.name}{" "}
          <span className="font-normal text-brown-sec">
            @{reply.author.handle} · {formatTimeAgo(reply.createdAt, locale)}
          </span>
        </p>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              autoFocus
              className="w-full resize-none rounded-lg border border-border bg-canvas px-2.5 py-1.5 text-sm text-brown placeholder:text-brown-sec/60 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="rounded-full px-3 py-1 text-xs text-brown-sec disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving || !editText.trim()}
                className="rounded-full bg-brown px-3 py-1 text-xs font-semibold text-canvas disabled:opacity-50"
              >
                {t("editSave")}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-ink">{text}</p>
        )}

        {!isEditing && (
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={liked}
              className={cn("flex items-center gap-1 text-xs transition-colors", liked ? "text-live" : "text-brown-sec")}
            >
              <Heart className={cn("size-3", liked && "fill-live")} />
              {count}
            </button>
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="flex items-center gap-1 text-xs text-brown-sec transition-colors"
                  aria-label={t("edit")}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-xs text-brown-sec transition-colors"
                  aria-label={t("delete")}
                >
                  <Trash2 className="size-3" />
                </button>
              </>
            )}
          </div>
        )}
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
  const toast = useToast();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies);
  const isOwner = currentUserId === comment.author.id;

  const { liked, count, toggle } = useOptimisticLike({
    initial: Boolean(comment.likedByMe),
    initialCount: comment.likes,
    onToggle: (next) => next ? likeComment(comment.id) : unlikeComment(comment.id),
  });

  const [text, setText] = useState(comment.text);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setEditText(text);
    setIsEditing(true);
  }

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === text) { setIsEditing(false); return; }
    setSaving(true);
    try {
      await updateComment(comment.id, trimmed);
      setText(trimmed);
      setIsEditing(false);
    } catch {
      toast.error(t("editError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch {
      toast.error(t("deleteError"));
    }
  }

  return (
    <div className="border-b border-border py-4 last:border-0">
      <div className="flex gap-3">
        <Avatar initial={comment.author.initial} src={comment.author.avatarUrl} alt={comment.author.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brown">
            {comment.author.name}{" "}
            <span className="font-normal text-brown-sec">
              @{comment.author.handle} · {formatTimeAgo(comment.createdAt, locale)}
            </span>
          </p>

          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                autoFocus
                className="w-full resize-none rounded-lg border border-border bg-canvas px-2.5 py-1.5 text-sm text-brown placeholder:text-brown-sec/60 focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="rounded-full px-3 py-1 text-xs text-brown-sec disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving || !editText.trim()}
                  className="rounded-full bg-brown px-3 py-1 text-xs font-semibold text-canvas disabled:opacity-50"
                >
                  {t("editSave")}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 text-sm text-ink">{text}</p>
          )}

          {!isEditing && (
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={toggle}
                aria-pressed={liked}
                className={cn("flex items-center gap-1 text-xs transition-colors", liked ? "text-live" : "text-brown-sec")}
              >
                <Heart className={cn("size-3.5", liked && "fill-live")} />
                {count}
              </button>

              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1 text-xs text-brown-sec transition-colors"
              >
                <CornerDownRight className="size-3.5" />
                {t("reply")}
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={startEdit}
                    className="flex items-center gap-1 text-xs text-brown-sec transition-colors"
                    aria-label={t("edit")}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-xs text-brown-sec transition-colors"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </>
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
          )}
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

export function PostDetailComments({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const t = useTranslations("app.comments");
  const currentUser = useCurrentUser();
  const currentUserId = useCurrentUserId();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    const text = input.trim();
    if (!text || pending) return;
    setPending(true);
    try {
      if (replyingTo) {
        const reply = await createReply(postId, replyingTo, text, currentUser);
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo ? { ...c, replies: [...c.replies, reply] } : c,
          ),
        );
        setReplyingTo(null);
      } else {
        const comment = await createComment(postId, text, currentUser);
        setComments((prev) => [...prev, comment]);
      }
      setInput("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-4">
      <div className="border-b border-border py-3">
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
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={replyingTo ? t("replyPlaceholder") : t("placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-brown outline-none placeholder:text-placeholder"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!input.trim() || pending}
            className="shrink-0 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {t("send")}
          </button>
        </div>
      </div>

      <div>
        {comments.length === 0 ? (
          <p className="py-12 text-center text-sm text-brown-sec">{t("empty")}</p>
        ) : (
          comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onReply={(id) => {
                setReplyingTo(id);
                setInput("");
              }}
              onDelete={(id) => setComments((prev) => prev.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
