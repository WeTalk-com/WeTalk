import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listPopularTags } from "../controllers/tag.controller.js";

export const tagRouter = Router();

tagRouter.get("/", requireAuth, listPopularTags);
