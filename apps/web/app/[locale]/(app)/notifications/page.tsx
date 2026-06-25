"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
import { refreshUnreadCount } from "@/lib/use-unread-count";
import { getSocket } from "@/lib/socket";
import type { Notification } from "@/lib/types";
import { TopBar } from "@/components/layout/top-bar";
import { NotificationItem } from "@/components/notifications/notification-item";

export default function NotificationsPage() {
  const t = useTranslations("app.notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (!socket) return;

    function onNewNotification(n: Notification) {
      setNotifications((prev) => [n, ...prev]);
    }

    socket.on("notification:new", onNewNotification);
    socket.connect();

    return () => {
      socket.off("notification:new", onNewNotification);
    };
  }, [fetchNotifications]);

  const router = useRouter();

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      // Met à jour la pastille (sidebar + mobile-nav) après lecture.
      refreshUnreadCount();
    } catch { /* silent */ }
  }

  function handleClick(n: Notification) {
    if (!n.read) handleMarkRead(n.id);
    if (n.postId) {
      router.push({ pathname: "/posts/[id]", params: { id: n.postId } });
    } else if (n.type === "follow" && n.actor.handle) {
      router.push({ pathname: "/profile/[handle]", params: { handle: n.actor.handle } });
    }
  }

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <TopBar />

      <div className="px-5 pb-4 pt-4">
        <h1 className="font-display text-4xl font-bold text-brown">
          {t("title")}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-brown-sec">
          {t("loading")}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex justify-center py-12 text-brown-sec">
          {t("empty")}
        </div>
      ) : (
        <ul className="pb-24 lg:pb-10">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              className="w-full text-left"
            >
              <NotificationItem notification={n} />
            </button>
          ))}
        </ul>
      )}
    </main>
  );
}
