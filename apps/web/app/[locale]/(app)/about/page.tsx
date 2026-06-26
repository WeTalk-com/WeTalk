import { getTranslations } from "next-intl/server";
import { StaticPage } from "@/components/layout/static-page";

export default async function AboutPage() {
  const t = await getTranslations("pages.about");
  return <StaticPage title={t("title")} body={t("body")} />;
}
