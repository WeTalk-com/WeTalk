import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getExploreTiles } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { ExploreFilters } from "@/components/explore/explore-filters";
import { ExploreTile } from "@/components/explore/explore-tile";

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

export default async function ExplorePage() {
  const t = await getTranslations("app.explore");
  const exploreTiles = await getExploreTiles();

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar searchPlaceholder={t("searchPlaceholder")} />

      <div className="px-5 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">
          {t("title")}
        </h1>
        <ExploreFilters />
      </div>

      {/* Grille masonry */}
      <div className="columns-2 gap-3 px-4 pb-24 pt-4 md:columns-3 lg:pb-10">
        {exploreTiles.map((tile) => (
          <ExploreTile key={tile.id} tile={tile} />
        ))}
      </div>
    </main>
  );
}
