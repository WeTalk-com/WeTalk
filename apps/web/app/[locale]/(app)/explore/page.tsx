import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser, getFollowingIds, getTrending, searchUsers } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { ExploreContent } from "@/components/explore/explore-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "metadata",
  });
  return { title: t("explore") };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("app.explore");
  const { q } = await searchParams;
  // getCurrentUser() est dédupliqué par cache() — appel gratuit si déjà résolu dans le layout.
  // On peut donc récupérer me.id immédiatement et lancer tous les appels en parallèle.
  const me = await getCurrentUser();
  const [trending, users, followingIds] = await Promise.all([
    getTrending(),
    searchUsers(q),
    getFollowingIds(me.id),
  ]);
  // Exclude self and already-followed users from the people list
  const visibleUsers = users.filter((u) => u.id !== me.id && !followingIds.includes(u.id));

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder={t("searchPlaceholder")} searchable />
      <ExploreContent trending={trending} users={visibleUsers} query={q ?? ""} />
    </main>
  );
}
