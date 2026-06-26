import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { idParamSchema, listQuerySchema, internalCreateSchema } from "../schemas/notification.schemas.js";
import type { Server as SocketServer } from "socket.io";
import { getController } from "../controllers/notification.controller.js";

export function createNotificationRouter(io: SocketServer): Router {
  const router = Router();
  const ctrl = getController(io);

  router.get("/", requireAuth, validateQuery(listQuerySchema), ctrl.getNotifications);
  router.get("/unread", requireAuth, ctrl.getUnread);
  router.patch("/read-all", requireAuth, ctrl.markAllRead);
  router.patch("/:id/read", requireAuth, validateParams(idParamSchema), ctrl.markRead);
  router.post("/internal", requireAuth, writeLimiter, validateBody(internalCreateSchema), ctrl.createInternal);

  return router;
}
