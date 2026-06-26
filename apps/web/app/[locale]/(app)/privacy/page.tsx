import { getTranslations } from "next-intl/server";
import { StaticPage } from "@/components/layout/static-page";

export default async function PrivacyPage() {
  const t = await getTranslations("pages.privacy");
  return <StaticPage title={t("title")} body={t("body")} />;
}
