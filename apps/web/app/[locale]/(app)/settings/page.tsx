import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { LogoutButton } from "@/components/auth/logout-button";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";

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
  return { title: t("settings") };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card as="section" className="p-5">
      <h2 className="font-display text-xl font-bold text-brown">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-brown-sec">{description}</p>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      <div className="px-5 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">
          {t("title")}
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-24 pt-5 lg:pb-10">
        <Section title={t("languageLabel")} description={t("languageDescription")}>
          <LanguageSwitcher />
        </Section>

        <Section title={t("themeLabel")} description={t("themeDescription")}>
          <ThemeSwitcher />
        </Section>

        <Section title={t("accountLabel")} description={t("accountDescription")}>
          <LogoutButton />
        </Section>

        <Section title={t("dangerLabel")} description={t("dangerDescription")}>
          <DeleteAccountButton />
        </Section>
      </div>
    </main>
  );
}
