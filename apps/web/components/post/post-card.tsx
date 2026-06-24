"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, ImageIcon, PlayCircle, Flag, Link as LinkIcon, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { formatTimeAgo } from "@/lib/format-time";
import { UserChip } from "../ui/user-chip";
import { PostActions } from "./post-actions";
import { ReportModal } from "./report-modal";
import { deletePost } from "@/lib/api";
import { useCurrentUserId } from "@/components/create/create-modal-provider";
import type { Post } from "@/lib/types";
import { UserHoverCard } from "@/components/ui/user-hover-card";

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

export function PostCard({ post }: { post: Post }) {
  const { author } = post;
  const t = useTranslations("app.post");
  const locale = useLocale();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const isOwner = currentUserId === author.id;

  const [showReport, setShowReport] = useState(false);

  async function handleDelete() {
    try {
      await deletePost(post.id);
      router.refresh();
    } catch {
      // silent — backend returns 403 if not author
    }
  }

  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("a, button, [role='menu']")) return;
    router.push({ pathname: "/posts/[id]", params: { id: post.id } });
  }

  function handleComment() {
    router.push({ pathname: "/posts/[id]", params: { id: post.id } });
  }

  return (
    <>
      <article
        onClick={handleCardClick}
        className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <UserHoverCard handle={author.handle}>
            <Link
              href={{ pathname: "/profile/[handle]", params: { handle: author.handle } }}
              className="min-w-0 flex-1"
            >
              <UserChip user={author} subtitle={`@${author.handle} · ${formatTimeAgo(post.createdAt, locale)}`} />
            </Link>
          </UserHoverCard>

          <PostMenu
            postId={post.id}
            locale={locale}
            isOwner={isOwner}
            onDelete={handleDelete}
            onReport={() => setShowReport(true)}
          />
        </div>

        <div className="mt-3">
          <PostText text={post.text} tags={post.tags} />
        </div>

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

        <div className="mt-4">
          <PostActions
            postId={post.id}
            likes={post.likes}
            likedByMe={post.likedByMe}
            comments={post.comments}
            onComment={handleComment}
          />
        </div>
      </article>

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
