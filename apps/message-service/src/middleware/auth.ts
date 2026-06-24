import type { NextFunction, Request, Response } from "express";
import { type JwtPayload, verifyAccessToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import { isAccessBanned } from "../utils/banStore.js";
import type { DefaultEventsMap, ExtendedError, Socket } from "socket.io";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

// Expose l'utilisateur authentifié sur le socket (rempli par socketRequireAuth).
declare module "socket.io" {
	interface Socket {
		user?: JwtPayload;
	}
}

const ACCESS_COOKIE = "wetalk_session";

function parseCookie(cookieStr: string, name: string): string | undefined {
	for (const part of cookieStr.split(";")) {
		const [key, val] = part.split("=");
		if (key?.trim() === name)
			return val?.trim();
	}
	return undefined;
}

// Vérifie le JWT d'accès localement avec JWT_ACCESS_SECRET.
// Ce secret étant partagé entre tous les microservices, ce middleware est
// copiable tel quel dans chaque service : pas d'appel réseau à auth-service.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
	const header = req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		res.status(401).json({ error: "Missing or malformed Authorization header" });
		return;
	}
	
	const token = header.slice("Bearer ".length);
	try {
		req.user = verifyAccessToken(token);
	} catch {
		res.status(401).json({ error: "Invalid or expired token" });
		return;
	}
	
	// Révocation immédiate : un access token encore valide est rejeté si l'utilisateur
	// figure dans la denylist Redis (banni). Fail-open si Redis est indisponible.
	try {
		if (await isAccessBanned(req.user.sub)) {
			res.status(403).json({ error: "Account banned" });
			return;
		}
	} catch (err) {
		logger.error("access ban check failed", {
			userId: req.user.sub,
			error: err instanceof Error ? err.message : String(err),
		});
		res.status(503).json({ error: "Authorization backend unavailable" });
		return;
	}
	
	next();
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