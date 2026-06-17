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
  } catch (err) {
    logger.warn("token rejected", { error: err instanceof Error ? err.message : String(err) });
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}
