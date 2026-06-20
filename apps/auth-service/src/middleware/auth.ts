import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";
import type { UserRole } from "../models/user.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Vérifie le JWT d'accès localement avec JWT_ACCESS_SECRET.
// Ce secret étant partagé entre tous les microservices, ce middleware est
// copiable tel quel dans chaque service : pas d'appel réseau à auth-service.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// RBAC : à chaîner après requireAuth. Autorise seulement les rôles listés.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
