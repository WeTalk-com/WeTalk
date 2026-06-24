import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listReports, dismissReport, removeReportedPost } from "../controllers/report.controller.js";

export const adminRouter = Router();

// Modération des signalements
adminRouter.get("/reports", requireAuth, requireRole("moderator", "admin"), listReports);
adminRouter.post("/reports/:id/dismiss", requireAuth, requireRole("moderator", "admin"), dismissReport);
adminRouter.post("/reports/:id/remove", requireAuth, requireRole("moderator", "admin"), removeReportedPost);
