import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Landing } from "@/components/landing/landing";

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
  return {
    title: t("landingTitle"),
    description: t("landingDescription"),
    openGraph: {
      title: t("landingTitle"),
      description: t("landingOgDescription"),
      type: "website",
    },
  };
}

export default function Page() {
  return <Landing />;
}
