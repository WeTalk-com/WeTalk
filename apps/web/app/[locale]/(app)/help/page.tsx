import { getTranslations } from "next-intl/server";
import { StaticPage } from "@/components/layout/static-page";

export default async function HelpPage() {
  const t = await getTranslations("pages.help");
  return <StaticPage title={t("title")} body={t("body")} />;
}
