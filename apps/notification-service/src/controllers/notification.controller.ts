import type { Request, Response } from "express";
import {
  createNotification,
  listNotifications,
  markAsRead,
  getUnreadCount,
} from "../services/notification.service.js";
import type { Server as SocketServer } from "socket.io";
import { fetchActorInfo } from "../utils/user-fetch.js";
import { logger } from "../utils/logger.js";

function forwardAuth(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  if (req.headers.authorization) headers.authorization = req.headers.authorization;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  return headers;
}

export function getController(io: SocketServer) {
  async function enrichNotifications(notifications: Array<Record<string, unknown>>, headers?: Record<string, string>) {
    const actorIds = [...new Set(notifications.map((n) => n.actorId as string))];
    const actorMap = new Map<string, unknown>();
    await Promise.all(
      actorIds.map(async (id) => {
        const info = await fetchActorInfo(id, headers);
        if (info) actorMap.set(id, info);
      }),
    );
    return notifications.map((n) => ({
      ...n,
      actor: actorMap.get(n.actorId as string) ?? null,
    }));
  }

  async function getNotifications(req: Request, res: Response): Promise<void> {
    const { cursor, limit } = req.query as { cursor?: string; limit?: number };

    const result = await listNotifications({
      userId: req.user!.sub,
      cursor,
      limit,
    });

    const enriched = await enrichNotifications(
      result.notifications as unknown as Array<Record<string, unknown>>,
      forwardAuth(req),
    );

    res.json({ notifications: enriched, nextCursor: result.nextCursor });
  }

  async function markRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const notification = await markAsRead(id!, req.user!.sub);
    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ notification });
  }

  async function createInternal(req: Request, res: Response): Promise<void> {
    const { type, recipientId, postId, commentId, preview } = req.body as {
      type: "like" | "comment" | "follow";
      recipientId: string;
      postId?: string;
      commentId?: string;
      preview?: string;
    };

    if (recipientId === req.user!.sub) {
      res.status(200).json({ skipped: true });
      return;
    }

    try {
      const notification = await createNotification({
        recipientId,
        actorId: req.user!.sub,
        type,
        postId,
        commentId,
        preview,
      });

      const enriched = await enrichNotifications(
        [notification.toObject() as unknown as Record<string, unknown>],
        forwardAuth(req),
      );

      io.to(`user:${recipientId}`).emit("notification:new", enriched[0]);

      res.status(201).json({ notification: enriched[0] });
    } catch (err) {
      logger.error("failed to create notification", {
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(500).json({ error: "Failed to create notification" });
    }
  }

  async function getUnread(req: Request, res: Response): Promise<void> {
    const count = await getUnreadCount(req.user!.sub);
    res.json({ count });
  }

  return { getNotifications, markRead, createInternal, getUnread };
}
