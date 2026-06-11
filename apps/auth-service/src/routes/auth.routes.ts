import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.js";
import {
  register,
  adminCreateUser,
  login,
  refresh,
  logout,
  me,
  verify,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

// Public
authRouter.post("/register", registerLimiter, register);
authRouter.post("/login", loginLimiter, login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

// Authentifié
authRouter.get("/me", requireAuth, me);
authRouter.get("/verify", requireAuth, verify);

// Admin (Fx1) — création de compte avec rôle au choix
authRouter.post("/admin/users", requireAuth, requireRole("admin"), adminCreateUser);
