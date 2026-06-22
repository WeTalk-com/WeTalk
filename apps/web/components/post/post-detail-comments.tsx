"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Heart, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment, Reply } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { createComment, createReply } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format-time";

function ReplyRow({ reply }: { reply: Reply }) {
  const [liked, setLiked] = useState(false);
  const locale = useLocale();
  return (
    <div className="ml-11 mt-2 flex gap-2.5">
      <Avatar initial={reply.author.initial} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brown">
          {reply.author.name}{" "}
          <span className="font-normal text-brown-sec">
            @{reply.author.handle} · {formatTimeAgo(reply.createdAt, locale)}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink">{reply.text}</p>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          className={`mt-1 flex items-center gap-1 text-xs transition-colors ${liked ? "text-live" : "text-brown-sec hover:text-live"}`}
        >
          <Heart className={`size-3 ${liked ? "fill-live" : ""}`} />
          {reply.likes + (liked ? 1 : 0)}
        </button>
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
  const locale = useLocale();
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="border-b border-border py-4 last:border-0">
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
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              aria-pressed={liked}
              className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-live" : "text-brown-sec hover:text-live"}`}
            >
              <Heart className={`size-3.5 ${liked ? "fill-live" : ""}`} />
              {comment.likes + (liked ? 1 : 0)}
            </button>

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

      {showReplies && comment.replies.map((r) => <ReplyRow key={r.id} reply={r} />)}
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
        const reply = await createReply(replyingTo, text);
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
      setInput("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-head text-base font-bold text-brown">
          {t("title")} ({comments.length})
        </h2>
      </div>

      <div className="px-4">
        {comments.length > 0 ? (
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
          <p className="py-8 text-center text-sm text-brown-sec">{t("empty")}</p>
        )}
      </div>

      <div className="border-t border-border px-4 py-4">
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
                handleSubmit();
              }
            }}
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
  );
}
