import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload, type UserRole } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const ACCESS_COOKIE = "wetalk_session";

// Token d'accès depuis le cookie httpOnly (front) ou le header Bearer (appels est-ouest).
function extractToken(req: Request): string | undefined {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Missing authentication" });
    return;
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    logger.warn("token rejected", { error: err instanceof Error ? err.message : String(err) });
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}

// Autorise seulement les rôles passés en params
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
