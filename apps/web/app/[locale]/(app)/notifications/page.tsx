import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getNotifications } from "@/lib/api";
import { TopBar } from "@/components/layout/top-bar";
import { NotificationItem } from "@/components/notifications/notification-item";

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
  return { title: t("notifications") };
}

export default async function NotificationsPage() {
  const t = await getTranslations("app.notifications");
  const notifications = await getNotifications();

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      <div className="px-5 pb-4 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">
          {t("title")}
        </h1>
      </div>

      <ul className="pb-24 lg:pb-10">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </ul>
    </main>
  );
}
