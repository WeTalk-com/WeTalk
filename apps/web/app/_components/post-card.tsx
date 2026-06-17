import { BadgeCheck, MoreHorizontal, ImageIcon } from "lucide-react";
import { Avatar } from "./avatar";
import { PostActions } from "./post-actions";
import type { Post } from "../../lib/mock-data";

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

  return (
    <article className="rounded-2xl bg-card border border-line p-4">
      {/* En-tete */}
      <div className="flex items-center gap-3">
        <Avatar initial={author.initial} />
        <div className="min-w-0">
          <div className="flex items-center gap-1 font-semibold text-ink">
            <span className="truncate">{author.name}</span>
            {author.verified && (
              <BadgeCheck className="size-4 text-gold shrink-0" />
            )}
          </div>
          <div className="text-sm text-ink-soft">
            @{author.handle} · {post.timeAgo}
          </div>
        </div>
        <button
          type="button"
          aria-label="Plus d'options"
          className="ml-auto grid place-items-center size-9 rounded-full text-ink-soft hover:bg-line/60"
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
            post image · {post.imageRatio}
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
    </article>
  );
}
