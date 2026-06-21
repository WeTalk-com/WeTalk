"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { ImageIcon, Heart } from "lucide-react";

type Tab = "posts" | "media" | "likes";

type Props = {
  posts: Post[];
};

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
  const [active, setActive] = useState<Tab>("posts");

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: t("tabPosts") },
    { key: "media", label: t("tabMedia") },
    { key: "likes", label: t("tabLikes") },
  ];

  const mediaPosts = posts.filter((p) => p.hasImage);

  return (
    <>
      {/* Onglets */}
      <div className="mt-5 flex border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            aria-pressed={active === key}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
              active === key ? "text-brown" : "text-brown-sec hover:text-brown"
            }`}
          >
            {label}
            {active === key && (
              <span className="absolute bottom-0 left-1/2 h-0.75 w-10 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        {active === "posts" && (
          posts.length > 0
            ? posts.map((post) => <PostCard key={post.id} post={post} />)
            : <EmptyState icon={<Heart className="size-10" />} text={t("postsEmpty")} />
        )}

        {active === "media" && (
          mediaPosts.length > 0
            ? mediaPosts.map((post) => <PostCard key={post.id} post={post} />)
            : <EmptyState icon={<ImageIcon className="size-10" />} text={t("mediaEmpty")} />
        )}

        {active === "likes" && (
          /* TODO(api): charger les posts likés via GET /me/likes */
          <EmptyState icon={<Heart className="size-10" />} text={t("likesEmpty")} />
        )}
      </div>
    </>
  );
}
