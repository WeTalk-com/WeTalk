import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import {
  createNotification,
  listNotifications,
  markAsRead,
  getUnreadCount,
} from "../services/notification.service.js";
import type { Server as SocketServer } from "socket.io";
import { fetchActorInfo } from "../utils/user-fetch.js";
import { logger } from "../utils/logger.js";

export function getController(io: SocketServer) {
  const listQuerySchema = z.object({
    cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  });

  const internalCreateSchema = z.object({
    type: z.enum(["like", "comment", "follow"]),
    recipientId: z.string().min(1),
    postId: z.string().optional(),
    commentId: z.string().optional(),
    preview: z.string().max(280).optional(),
  });

  async function enrichNotifications(notifications: Array<Record<string, unknown>>) {
    const actorIds = [...new Set(notifications.map((n) => n.actorId as string))];
    const actorMap = new Map<string, unknown>();
    await Promise.all(
      actorIds.map(async (id) => {
        const info = await fetchActorInfo(id);
        if (info) actorMap.set(id, info);
      }),
    );
    return notifications.map((n) => ({
      ...n,
      actor: actorMap.get(n.actorId as string) ?? null,
    }));
  }

  async function getNotifications(req: Request, res: Response): Promise<void> {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    const result = await listNotifications({
      userId: req.user!.sub,
      cursor: parsed.data.cursor,
      limit: parsed.data.limit,
    });

    const enriched = await enrichNotifications(
      result.notifications as unknown as Array<Record<string, unknown>>,
    );

    res.json({ notifications: enriched, nextCursor: result.nextCursor });
  }

  async function markRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "Invalid notification id" });
      return;
    }

    const notification = await markAsRead(id!, req.user!.sub);
    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ notification });
  }

  async function createInternal(req: Request, res: Response): Promise<void> {
    const parsed = internalCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    if (parsed.data.recipientId === req.user!.sub) {
      res.status(200).json({ skipped: true });
      return;
    }

    try {
      const notification = await createNotification({
        recipientId: parsed.data.recipientId,
        actorId: req.user!.sub,
        type: parsed.data.type,
        postId: parsed.data.postId,
        commentId: parsed.data.commentId,
        preview: parsed.data.preview,
      });

      const enriched = await enrichNotifications([
        notification.toObject() as unknown as Record<string, unknown>,
      ]);

      io.to(`user:${parsed.data.recipientId}`).emit("notification:new", enriched[0]);

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
