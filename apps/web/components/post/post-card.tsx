"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, ImageIcon, PlayCircle, Flag, Link as LinkIcon, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { formatTimeAgo } from "@/lib/format-time";
import { UserChip } from "../ui/user-chip";
import { PostActions } from "./post-actions";
import { CommentThread } from "./comment-thread";
import { ReportModal } from "./report-modal";
import { getComments, deletePost } from "@/lib/api";
import { useCurrentUserId } from "@/components/create/create-modal-provider";
import type { Post, Comment } from "@/lib/types";
import { useToast } from "@/components/ui/toast-provider";
import { UserHoverCard } from "@/components/ui/user-hover-card";
import { MentionText } from "@/components/ui/mention-text";
import { FollowButton } from "@/components/ui/follow-button";

function PostText({ text }: { text: string }) {
  // Les #hashtags sont déjà inline dans le contenu : MentionText les met en
  // valeur (avec les @mentions). Pas de chips séparés pour éviter les doublons.
  return (
    <p className="break-words text-ink leading-relaxed">
      <MentionText text={text} />
    </p>
  );
}

function PostMenu({
  postId,
  locale,
  isOwner,
  onReport,
  onDelete,
}: {
  postId: string;
  locale: string;
  isOwner: boolean;
  onReport: () => void;
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
          className="grid size-9 place-items-center rounded-full text-brown-sec"
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
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-brown outline-none data-[highlighted]:bg-canvas"
          >
            <LinkIcon className="size-4 text-brown-sec" />
            {t("copyLink")}
          </DropdownMenu.Item>

          {isOwner ? (
            <DropdownMenu.Item
              onSelect={onDelete}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-live outline-none data-[highlighted]:bg-live/5"
            >
              <Trash2 className="size-4" />
              {t("delete")}
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              onSelect={onReport}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-live outline-none data-[highlighted]:bg-live/5"
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

export function PostCard({ post, isFollowingAuthor }: { post: Post; isFollowingAuthor?: boolean }) {
  const { author } = post;
  const t = useTranslations("app.post");
  const locale = useLocale();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const toast = useToast();
  const isOwner = currentUserId === author.id;

  const [showReport, setShowReport] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);

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

  async function handleDelete() {
    try {
      await deletePost(post.id);
      router.refresh();
    } catch {
      toast.error(t("toastDeleteError"));
    }
  }

  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    // Ne pas naviguer si le clic provient d'un bouton, d'un lien, du champ commentaire ou du menu.
    if ((e.target as HTMLElement).closest("a, button, textarea, [role='menu']")) return;
    router.push({ pathname: "/posts/[id]", params: { id: post.id } });
  }

  return (
    <>
      <article
        onClick={handleCardClick}
        className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-colors"
      >
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <UserHoverCard handle={author.handle}>
            <Link
              href={{ pathname: "/profile/[handle]", params: { handle: author.handle } }}
              className="min-w-0 flex-1"
            >
              <UserChip user={author} subtitle={`@${author.handle} · ${formatTimeAgo(post.createdAt, locale)}`} />
            </Link>
          </UserHoverCard>

          {isFollowingAuthor !== undefined && !isOwner && (
            <FollowButton userId={author.id} initialFollowing={isFollowingAuthor} size="sm" />
          )}

          <PostMenu
            postId={post.id}
            locale={locale}
            isOwner={isOwner}
            onDelete={handleDelete}
            onReport={() => setShowReport(true)}
          />
        </div>

        {/* Texte — posts immuables, pas d'édition */}
        <div className="mt-3">
          <PostText text={post.text} />
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
          onCommentDeleted={() => setCommentCount((c) => Math.max(0, c - 1))}
        />
      )}

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
