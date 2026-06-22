import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";
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

function extractToken(req: Request): string | undefined {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;
  if (!header) return undefined;
  const [scheme, token] = header.trim().split(/\s+/, 2);
  return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
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
