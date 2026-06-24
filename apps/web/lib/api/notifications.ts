import type { Notification } from "@/lib/types";
import { apiFetch } from "./client";
import { mapNotification, type BackendNotificationListResponse, type BackendNotification } from "./map-notification";

export async function getNotifications(): Promise<Notification[]> {
  const data = await apiFetch<BackendNotificationListResponse>("/notifications");
  return data.notifications.map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>("/notifications/unread");
  return data.count;
}
