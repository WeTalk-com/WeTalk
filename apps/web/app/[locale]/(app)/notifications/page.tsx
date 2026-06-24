"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
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
    } catch {
      // Keep empty list on error
    } finally {
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

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // ignore
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
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex justify-center py-12 text-brown-sec">
          No notifications yet
        </div>
      ) : (
        <ul className="pb-24 lg:pb-10">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={n.read ? "" : "cursor-pointer"}
            >
              <NotificationItem notification={n} />
            </div>
          ))}
        </ul>
      )}
    </main>
  );
}
