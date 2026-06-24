import type { Notification, NotificationType } from "@/lib/types";

export type BackendNotification = {
  _id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  preview?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  actor: {
    id: string;
    username: string;
    displayName: string | null;
    profileImage: string | null;
  } | null;
};

export function mapNotification(n: BackendNotification): Notification {
  const actor = n.actor;
  const name = actor?.displayName?.trim() || actor?.username || "Unknown";
  return {
    id: n._id,
    type: n.type,
    actor: {
      id: actor?.id ?? n.actorId,
      name,
      handle: actor?.username ?? "unknown",
      initial: name.charAt(0).toUpperCase(),
      avatarUrl: actor?.profileImage ?? undefined,
    },
    text: n.type === "like" ? "liked your post" : n.type === "comment" ? "commented on your post" : n.type === "follow" ? "started following you" : "",
    preview: n.preview,
    createdAt: n.createdAt,
    read: n.read,
  };
}

export type BackendNotificationListResponse = {
  notifications: BackendNotification[];
  nextCursor: string | null;
};
