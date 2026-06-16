import { useTranslations } from "next-intl";
import { MoreHorizontal, ImageIcon } from "lucide-react";
import { Card } from "../ui/card";
import { UserChip } from "../ui/user-chip";
import { PostActions } from "./post-actions";
import type { Post } from "@/lib/types";

/** Affiche le texte du post avec les hashtags colores en or */
function PostText({ text, tags }: { text: string; tags: string[] }) {
  return (
    <p className="text-ink leading-relaxed">
      {text}{" "}
      {tags.map((tag) => (
        <span key={tag} className="text-gold font-medium">
          {tag}{" "}
        </span>
      ))}
    </p>
  );
}

export function PostCard({ post }: { post: Post }) {
  const { author } = post;
  const t = useTranslations("app.post");

  return (
    <Card as="article" className="p-4">
      {/* En-tete */}
      <div className="flex items-center gap-3">
        <UserChip
          user={author}
          subtitle={`@${author.handle} · ${post.timeAgo}`}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          aria-label={t("more")}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-line/60"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Texte */}
      <div className="mt-3">
        <PostText text={post.text} tags={post.tags} />
      </div>

      {/* Image (placeholder design) */}
      {post.hasImage && (
        <div className="mt-3 rounded-xl border border-line bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(194,136,43,0.08)_12px,rgba(194,136,43,0.08)_24px)] aspect-16/10 grid place-items-center">
          <span className="flex flex-col items-center gap-1 text-ink-soft text-sm">
            <ImageIcon className="size-6" />
            {t("image", { ratio: post.imageRatio ?? "" })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4">
        <PostActions
          likes={post.likes}
          comments={post.comments}
          shares={post.shares}
        />
      </div>
    </Card>
  );
}
