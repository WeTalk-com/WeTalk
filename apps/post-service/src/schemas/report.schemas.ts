import { z } from "zod";

export const reportReasonSchema = z.enum([
  "spam",
  "harassment",
  "inappropriate",
  "misinformation",
  "other",
]);

export const reportStatusSchema = z.enum(["pending", "resolved", "dismissed"]);

export const reportBodySchema = z.object({
  reason: reportReasonSchema,
  details: z.string().trim().max(280).optional(),
});

export const reportsQuerySchema = z.object({
  status: reportStatusSchema.default("pending"),
});
