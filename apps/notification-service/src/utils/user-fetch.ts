import { env } from "../config/env.js";
import { logger } from "./logger.js";

export type ActorInfo = {
  id: string;
  username: string;
  displayName: string | null;
  profileImage: string | null;
};

export async function fetchActorInfo(actorId: string): Promise<ActorInfo | null> {
  try {
    const res = await fetch(`${env.userServiceUrl}/users/${actorId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger.warn("actor lookup failed", { actorId, status: res.status });
      return null;
    }
    return await res.json() as ActorInfo;
  } catch (err) {
    logger.warn("actor lookup error", {
      actorId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
