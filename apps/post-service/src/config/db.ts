import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Ouvre la connexion à la base et journalise les erreurs de connexion.
export async function connectDb(): Promise<void> {
  mongoose.connection.on("error", (err: Error) => {
    logger.error("mongo connection error", { error: err.message });
  });
  await mongoose.connect(env.mongoUri);
}

export { mongoose };
