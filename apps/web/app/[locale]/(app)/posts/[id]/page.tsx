import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPost, getComments } from "@/lib/api";
import { PostCard } from "@/components/post/post-card";
import { PostDetailComments } from "@/components/post/post-detail-comments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "metadata" });
  try {
    const post = await getPost(id);
    const excerpt = post.text.length > 60 ? `${post.text.slice(0, 60)}…` : post.text;
    return { title: `@${post.author.handle} on WeTalk: "${excerpt}"` };
  } catch {
    return { title: t("rootTitle") };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  let post;
  try {
    post = await getPost(id);
  } catch {
    notFound();
  }

  const [comments, t] = await Promise.all([
    getComments(id),
    getTranslations("app.post"),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur">
        <Link
          href="/home"
          aria-label={t("backLabel")}
          className="grid size-9 place-items-center rounded-full text-brown transition-colors hover:bg-canvas"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-head text-xl font-bold text-brown">{t("pageTitle")}</h1>
      </header>

      <div className="flex flex-col gap-5 px-4 pb-24 pt-4 lg:pb-10">
        <PostCard post={post} />
        <PostDetailComments postId={id} initialComments={comments} />
      </div>
    </main>
  );
}
