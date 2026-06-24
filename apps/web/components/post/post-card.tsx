"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, ImageIcon, PlayCircle, Flag, Link as LinkIcon, Trash2, Pencil } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { formatTimeAgo } from "@/lib/format-time";
import { UserChip } from "../ui/user-chip";
import { PostActions } from "./post-actions";
import { CommentThread } from "./comment-thread";
import { ReportModal } from "./report-modal";
import { getComments, deletePost, updatePost } from "@/lib/api";
import { useCurrentUserId } from "@/components/create/create-modal-provider";
import type { Post, Comment } from "@/lib/types";
import { cn } from "@/lib/cn";

function PostText({ text, tags }: { text: string; tags: string[] }) {
  return (
    <p className="break-words text-ink leading-relaxed">
      {text}{" "}
      {tags.map((tag) => (
        <span key={tag} className="font-medium text-gold">
          {tag}{" "}
        </span>
      ))}
    </p>
  );
}

function PostMenu({
  postId,
  locale,
  isOwner,
  onReport,
  onEdit,
  onDelete,
}: {
  postId: string;
  locale: string;
  isOwner: boolean;
  onReport: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("app.post");

  function copyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/${locale}/posts/${postId}`,
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("more")}
          className="grid size-9 place-items-center rounded-full text-brown-sec hover:bg-canvas"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-20 min-w-44 rounded-xl border border-border bg-card py-1 shadow-card"
        >
          <DropdownMenu.Item
            onSelect={copyLink}
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-brown outline-none hover:bg-canvas data-[highlighted]:bg-canvas"
          >
            <LinkIcon className="size-4 text-brown-sec" />
            {t("copyLink")}
          </DropdownMenu.Item>

          {isOwner ? (
            <>
              <DropdownMenu.Item
                onSelect={onEdit}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-brown outline-none hover:bg-canvas data-[highlighted]:bg-canvas"
              >
                <Pencil className="size-4 text-brown-sec" />
                {t("edit")}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={onDelete}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-live outline-none hover:bg-live/5 data-[highlighted]:bg-live/5"
              >
                <Trash2 className="size-4" />
                {t("delete")}
              </DropdownMenu.Item>
            </>
          ) : (
            <DropdownMenu.Item
              onSelect={onReport}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-live outline-none hover:bg-live/5 data-[highlighted]:bg-live/5"
            >
              <Flag className="size-4" />
              {t("report")}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function PostCard({ post }: { post: Post }) {
  const { author } = post;
  const t = useTranslations("app.post");
  const locale = useLocale();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const isOwner = currentUserId === author.id;

  const MAX_CHARS = 280;

  const [showReport, setShowReport] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [currentText, setCurrentText] = useState(post.text);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(false);

  async function openComments() {
    setShowComments(true);
    if (comments === null) {
      setCommentsLoading(true);
      try {
        const data = await getComments(post.id);
        setComments(data);
      } finally {
        setCommentsLoading(false);
      }
    }
  }

  function handleStartEdit() {
    setEditText(currentText);
    setEditError(false);
    setEditing(true);
  }

  async function handleSaveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === currentText) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setEditError(false);
    try {
      await updatePost(post.id, trimmed);
      setCurrentText(trimmed);
      setEditing(false);
    } catch {
      setEditError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deletePost(post.id);
      router.refresh();
    } catch {
      // silent — backend returns 403 if not author
    }
  }

  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    // Ne pas naviguer si le clic provient d'un bouton, d'un lien ou du menu contextuel.
    if ((e.target as HTMLElement).closest("a, button, [role='menu']")) return;
    router.push({ pathname: "/posts/[id]", params: { id: post.id } });
  }

  return (
    <>
      <article
        onClick={handleCardClick}
        className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-canvas/60"
      >
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <Link
            href={{ pathname: "/profile/[handle]", params: { handle: author.handle } }}
            className="min-w-0 flex-1"
          >
            <UserChip user={author} subtitle={`@${author.handle} · ${formatTimeAgo(post.createdAt, locale)}`} />
          </Link>

          <PostMenu
            postId={post.id}
            locale={locale}
            isOwner={isOwner}
            onEdit={handleStartEdit}
            onDelete={handleDelete}
            onReport={() => setShowReport(true)}
          />
        </div>

        {/* Texte / Mode édition */}
        <div className="mt-3">
          {editing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={MAX_CHARS}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-brown placeholder:text-brown-sec/60 focus:outline-none focus:ring-2 focus:ring-gold/40"
                placeholder={t("editPlaceholder")}
              />
              <div className="mt-1 flex items-center justify-between">
                <span className={cn("text-xs", editText.length >= MAX_CHARS ? "text-live" : "text-brown-sec")}>
                  {editText.length}/{MAX_CHARS}
                </span>
                {editError && (
                  <span className="text-xs text-live">{t("editError")}</span>
                )}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-full px-4 py-1.5 text-sm text-brown-sec hover:bg-canvas disabled:opacity-50"
                >
                  {t("editCancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving || !editText.trim() || editText.length > MAX_CHARS}
                  className="rounded-full bg-brown px-4 py-1.5 text-sm font-semibold text-canvas hover:bg-brown/90 disabled:opacity-50"
                >
                  {t("editSave")}
                </button>
              </div>
            </div>
          ) : (
            <PostText text={currentText} tags={post.tags} />
          )}
        </div>

        {/* Image (Fx18) — réelle si URL, sinon placeholder design (mocks) */}
        {post.imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={t("image", { ratio: post.imageRatio ?? "" })}
              className="max-h-[32rem] w-full object-cover"
            />
          </div>
        ) : (
          post.hasImage && (
            <div className="mt-3 grid aspect-16/10 place-items-center rounded-xl border border-border bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(194,136,43,0.08)_12px,rgba(194,136,43,0.08)_24px)]">
              <span className="flex flex-col items-center gap-1 text-sm text-brown-sec">
                <ImageIcon className="size-6" />
                {t("image", { ratio: post.imageRatio ?? "" })}
              </span>
            </div>
          )
        )}

        {/* Vidéo (Fx19) — réelle si URL, sinon placeholder design (mocks) */}
        {post.videoUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <video
              src={post.videoUrl}
              controls
              className="max-h-[32rem] w-full bg-dark/5 object-contain"
            />
          </div>
        ) : (
          post.hasVideo && (
            <div className="mt-3 grid aspect-16/10 place-items-center rounded-xl border border-border bg-dark/5 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(0,0,0,0.04)_12px,rgba(0,0,0,0.04)_24px)]">
              <span className="flex flex-col items-center gap-1 text-sm text-brown-sec">
                <PlayCircle className="size-8 text-brown-sec/60" />
                {t("video")}
              </span>
            </div>
          )
        )}

        {/* Actions */}
        <div className="mt-4">
          <PostActions
            postId={post.id}
            likes={post.likes}
            likedByMe={post.likedByMe}
            comments={commentCount}
            onComment={openComments}
          />
        </div>
      </article>

      {showComments && (
        <CommentThread
          postId={post.id}
          initialComments={comments ?? []}
          loading={commentsLoading}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
