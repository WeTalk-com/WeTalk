"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useTranslations } from "next-intl";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { Heart } from "lucide-react";

type Props = { posts: Post[] };

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-brown-sec">
      <span className="opacity-40">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function ProfileTabs({ posts }: Props) {
  const t = useTranslations("app.profile");

  return (
    <Tabs.Root defaultValue="posts" className="mt-5">
      <Tabs.List className="flex border-b border-border">
        {([["posts", t("tabPosts")], ["likes", t("tabLikes")]] as const).map(([key, label]) => (
          <Tabs.Trigger
            key={key}
            value={key}
            className="relative flex-1 pb-3 text-sm font-semibold text-brown-sec transition-colors hover:text-brown data-[state=active]:text-brown"
          >
            {label}
            <span className="absolute bottom-0 left-1/2 h-0.75 w-10 -translate-x-1/2 rounded-full bg-gold opacity-0 transition-opacity data-[state=active]:opacity-100" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="posts" className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {posts.length > 0
          ? posts.map((post) => <PostCard key={post.id} post={post} />)
          : <EmptyState icon={<Heart className="size-10" />} text={t("postsEmpty")} />}
      </Tabs.Content>

      <Tabs.Content value="likes" className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {/* TODO(api): charger les posts likés via GET /me/likes */}
        <EmptyState icon={<Heart className="size-10" />} text={t("likesEmpty")} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
