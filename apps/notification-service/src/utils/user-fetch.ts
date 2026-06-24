import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "./logger.js";
import type { ActorInfo } from "../schemas/types.js";

export async function fetchActorInfo(actorId: string, headers?: Record<string, string>): Promise<ActorInfo | null> {
  try {
    const res = await axios.get(`${env.userServiceUrl}/users/${actorId}`, {
      headers,
      timeout: 3000,
    });
    return res.data as ActorInfo;
  } catch (err) {
    logger.warn("actor lookup failed", {
      actorId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
