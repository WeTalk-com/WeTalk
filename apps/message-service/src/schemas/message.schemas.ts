import { z } from "zod";

// Param :id — toujours un UUID (sinon findByPk lève une erreur Postgres -> 500).
export const idParamSchema = z.object({
	id: z.string().uuid({ message: "Invalid user id" }),
});