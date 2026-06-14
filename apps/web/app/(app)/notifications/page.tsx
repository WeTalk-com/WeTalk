import type { Metadata } from "next";
import { TopBar } from "@/app/_components/layout/top-bar";
import { PillTabs } from "@/app/_components/ui/pill-tabs";
import { NotificationItem } from "@/app/_components/notifications/notification-item";
import { notifications } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Notifications · WeTalk",
};

export default function NotificationsPage() {
  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">
          Notifications
        </h1>
        <PillTabs tabs={["All", "Mentions"]} />
      </div>

      <ul className="pb-24 lg:pb-10">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </ul>
    </main>
  );
}
