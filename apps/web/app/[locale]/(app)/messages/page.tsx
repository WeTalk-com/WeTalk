import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getConversations } from "@/lib/api";
import { MessagesLayout } from "@/components/messages/messages-layout";

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
  return { title: t("messages") };
}

export default async function MessagesPage() {
  const conversations = await getConversations().catch(() => []);

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:border-x lg:border-border" style={{ height: "100dvh" }}>
      <MessagesLayout conversations={conversations} />
    </main>
  );
}
