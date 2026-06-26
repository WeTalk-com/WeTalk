"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { refreshUnreadCount } from "@/lib/use-unread-count";
import { getSocket } from "@/lib/socket";
import type { Notification } from "@/lib/types";
import { NotificationItem } from "@/components/notifications/notification-item";

export default function NotificationsPage() {
  const t = useTranslations("app.notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { notifications: data, nextCursor: cursor } = await getNotifications();
        if (cancelled) return;
        setNotifications(data);
        setNextCursor(cursor);
        // Ouvrir la page = tout marquer lu → on remet la pastille à zéro.
        await markAllNotificationsRead();
        refreshUnreadCount();
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const socket = getSocket();
    if (!socket) return () => { cancelled = true; };

    function onNewNotification(n: Notification) {
      setNotifications((prev) => [n, ...prev]);
    }

    socket.on("notification:new", onNewNotification);
    socket.connect();

    return () => {
      cancelled = true;
      socket.off("notification:new", onNewNotification);
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { notifications: more, nextCursor: cursor } = await getNotifications(nextCursor);
      setNotifications((prev) => [...prev, ...more]);
      setNextCursor(cursor);
    } catch { /* silent */ } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

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
      <div className="px-5 pb-4 pt-6">
        <h1 className="font-display text-3xl font-bold text-brown">
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
          {nextCursor && (
            <li className="flex justify-center py-4">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-brown-sec transition-colors hover:bg-canvas disabled:opacity-50"
              >
                {loadingMore ? t("loading") : t("loadMore")}
              </button>
            </li>
          )}
        </ul>
      )}
    </main>
  );
}
