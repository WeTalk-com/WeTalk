import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { Server as SocketServer } from "socket.io";
import { getController } from "../controllers/notification.controller.js";

export function createNotificationRouter(io: SocketServer): Router {
  const router = Router();
  const ctrl = getController(io);

  router.get("/", requireAuth, ctrl.getNotifications);
  router.get("/unread", requireAuth, ctrl.getUnread);
  router.patch("/:id/read", requireAuth, ctrl.markRead);
  router.post("/internal", requireAuth, ctrl.createInternal);

  return router;
}
