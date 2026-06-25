"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useTranslations, useLocale } from "next-intl";
import type { Post, Comment } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { Avatar } from "@/components/ui/avatar";
import { MentionText } from "@/components/ui/mention-text";
import { formatTimeAgo } from "@/lib/format-time";
import { Heart, MessageCircle, FileText } from "lucide-react";

type Props = { posts: Post[]; likedPosts: Post[]; comments: Comment[] };

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-brown-sec">
      <span className="opacity-40">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// Carte commentaire : auteur + texte, alignée sur le rendu de comment-thread.
function CommentItem({ comment }: { comment: Comment }) {
  const locale = useLocale();
  return (
    <div className="flex gap-3 border-b border-border pb-4 last:border-0">
      <Avatar initial={comment.author.initial} src={comment.author.avatarUrl} alt={comment.author.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brown">
          {comment.author.name}{" "}
          <span className="font-normal text-brown-sec">
            @{comment.author.handle} · {formatTimeAgo(comment.createdAt, locale)}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink"><MentionText text={comment.text} /></p>
      </div>
    </div>
  );
}

export function ProfileTabs({ posts, likedPosts, comments }: Props) {
  const t = useTranslations("app.profile");

  const tabs = [
    { key: "posts", label: t("tabPosts"), Icon: FileText },
    { key: "likes", label: t("tabLikes"), Icon: Heart },
    { key: "comments", label: t("tabComments"), Icon: MessageCircle },
  ] as const;

  return (
    <Tabs.Root defaultValue="posts" className="mt-5">
      <Tabs.List className="flex border-b border-border">
        {tabs.map(({ key, label, Icon }) => (
          <Tabs.Trigger
            key={key}
            value={key}
            className="relative flex flex-1 items-center justify-center gap-2 pb-3 text-sm font-semibold text-brown-sec transition-colors data-[state=active]:text-brown"
          >
            <Icon className="size-4" />
            {label}
            <span className="absolute bottom-0 left-1/2 h-0.75 w-10 -translate-x-1/2 rounded-full bg-gold opacity-0 transition-opacity data-[state=active]:opacity-100" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="posts" className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {posts.length > 0
          ? posts.map((post) => <PostCard key={post.id} post={post} />)
          : <EmptyState icon={<FileText className="size-10" />} text={t("postsEmpty")} />}
      </Tabs.Content>

      <Tabs.Content value="likes" className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {likedPosts.length > 0
          ? likedPosts.map((post) => <PostCard key={post.id} post={post} />)
          : <EmptyState icon={<Heart className="size-10" />} text={t("likesEmpty")} />}
      </Tabs.Content>

      <Tabs.Content value="comments" className="flex flex-col gap-4 px-4 pb-24 pt-5 lg:pb-10">
        {comments.length > 0
          ? comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          : <EmptyState icon={<MessageCircle className="size-10" />} text={t("commentsEmpty")} />}
      </Tabs.Content>
    </Tabs.Root>
  );
}
