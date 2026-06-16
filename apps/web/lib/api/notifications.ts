import type { Notification } from "@/lib/types";
import { notifications } from "@/lib/mock-data";

/** Notifications de l'utilisateur courant. */
export async function getNotifications(): Promise<Notification[]> {
  // TODO(api): return apiFetch<Notification[]>("/me/notifications");
  return notifications;
}
