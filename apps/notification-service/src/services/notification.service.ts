import { NotificationModel, type INotification, type NotificationType } from "../models/notification.js";
import { logger } from "../utils/logger.js";

export interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  preview?: string;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<INotification> {
  const notification = await NotificationModel.create({
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId ?? undefined,
    commentId: input.commentId ?? undefined,
    preview: input.preview ?? undefined,
    read: false,
  });

  logger.info("notification created", {
    id: String(notification._id),
    type: input.type,
    recipientId: input.recipientId,
    actorId: input.actorId,
  });

  return notification;
}

export interface ListNotificationsOptions {
  userId: string;
  limit?: number;
  cursor?: string;
}

export interface NotificationData {
  _id: string;
  recipientId: string;
  actorId: string;
  type: string;
  postId?: string;
  commentId?: string;
  preview?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function listNotifications(
  options: ListNotificationsOptions,
): Promise<{ notifications: NotificationData[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { recipientId: options.userId };
  if (options.cursor) {
    filter._id = { $lt: options.cursor };
  }

  const limit = Math.min(options.limit ?? 20, 50);
  const docs = await NotificationModel.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .lean()
    .exec();

  const notifications = docs.map((d) => ({
    _id: String(d._id),
    recipientId: d.recipientId,
    actorId: d.actorId,
    type: d.type as string,
    postId: d.postId,
    commentId: d.commentId,
    preview: d.preview,
    read: d.read,
    createdAt: d.createdAt as unknown as Date,
    updatedAt: d.updatedAt as unknown as Date,
  }));

  const last = notifications.at(-1);
  const nextCursor = notifications.length === limit && last
    ? String(last._id)
    : null;

  return { notifications, nextCursor };
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<NotificationData | null> {
  const doc = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { read: true },
    { new: true },
  ).lean().exec();

  if (!doc) return null;

  return {
    _id: String(doc._id),
    recipientId: doc.recipientId,
    actorId: doc.actorId,
    type: doc.type as string,
    postId: doc.postId,
    commentId: doc.commentId,
    preview: doc.preview,
    read: doc.read,
    createdAt: doc.createdAt as unknown as Date,
    updatedAt: doc.updatedAt as unknown as Date,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return NotificationModel.countDocuments({ recipientId: userId, read: false });
}
