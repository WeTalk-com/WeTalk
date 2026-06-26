import type { Notification } from "@/lib/types";
import { apiFetch } from "./client";
import { mapNotification, type BackendNotificationListResponse } from "./map-notification";

/** Page de notifications + curseur pour charger la suite (pagination). */
export async function getNotifications(
  cursor?: string,
): Promise<{ notifications: Notification[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const data = await apiFetch<BackendNotificationListResponse>(`/notifications${qs}`);
  return {
    notifications: data.notifications.map(mapNotification),
    nextCursor: data.nextCursor,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

/** Marque toutes les notifications comme lues. Renvoie le nombre mis à jour. */
export async function markAllNotificationsRead(): Promise<number> {
  const data = await apiFetch<{ updated: number }>("/notifications/read-all", {
    method: "PATCH",
  });
  return data.updated;
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>("/notifications/unread");
  return data.count;
}
