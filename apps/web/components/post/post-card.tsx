"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  onDelete,
  onClose,
}: {
  postId: string;
  locale: string;
  isOwner: boolean;
  onReport: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("app.post");

  function copyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/${locale}/posts/${postId}`,
    );
    onClose();
  }

  return (
    <ul
      role="menu"
      className="absolute right-0 top-10 z-20 min-w-44 rounded-xl border border-border bg-card py-1 shadow-card"
    >
      <li role="none">
        <button
          type="button"
          role="menuitem"
          onClick={copyLink}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-brown hover:bg-canvas"
        >
          <LinkIcon className="size-4 text-brown-sec" />
          {t("copyLink")}
        </button>
      </li>
      {isOwner ? (
        <li role="none">
          <button
            type="button"
            role="menuitem"
            onClick={() => { onDelete(); onClose(); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-live hover:bg-live/5"
          >
            <Trash2 className="size-4" />
            {t("delete")}
          </button>
        </li>
      ) : (
        <li role="none">
          <button
            type="button"
            role="menuitem"
            onClick={() => { onReport(); onClose(); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-live hover:bg-live/5"
          >
            <Flag className="size-4" />
            {t("report")}
          </button>
        </li>
      )}
    </ul>
  );
}

export function PostCard({ post }: { post: Post }) {
  const { author } = post;
  const t = useTranslations("app.post");
  const locale = useLocale();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const isOwner = currentUserId === author.id;

  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showMenu]);

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

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label={t("more")}
              aria-expanded={showMenu}
              onClick={() => setShowMenu((v) => !v)}
              className="grid size-9 place-items-center rounded-full text-brown-sec hover:bg-canvas"
            >
              <MoreHorizontal className="size-5" />
            </button>
            {showMenu && (
              <PostMenu
                postId={post.id}
                locale={locale}
                isOwner={isOwner}
                onDelete={handleDelete}
                onReport={() => setShowReport(true)}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        </div>

        {/* Texte */}
        <div className="mt-3">
          <PostText text={post.text} tags={post.tags} />
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
