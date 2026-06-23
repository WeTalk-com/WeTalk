import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import type { DefaultEventsMap, ExtendedError, Socket } from "socket.io";

declare global {
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
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

function parseCookie(cookieStr: string, name: string): string | undefined {
  for (const part of cookieStr.split(";")) {
    const [key, val] = part.split("=");
    if (key?.trim() === name) return val?.trim();
  }
  return undefined;
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
  }
}

export function socketRequireAuth() {
  return (socket: Socket<DefaultEventsMap, DefaultEventsMap>, next: (err?: ExtendedError | undefined) => void) => {
    const cookieStr = socket.handshake.headers.cookie ?? "";
    const token = parseCookie(cookieStr, ACCESS_COOKIE);

    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }

    try {
      const payload = verifyAccessToken(token);
      (socket as unknown as Record<string, unknown>).userId = payload.sub;
      return next();
    } catch {
      return next(new Error("Authentication error: invalid token"));
    }
  };
}
