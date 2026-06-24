import { Schema, model, type InferSchemaType } from "mongoose";

// Traité par les modérateurs/admins
const reportSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    reporterId: { type: String, required: true }, // UUID du signaleur
    reason: {
      type: String,
      required: true,
      enum: ["spam", "harassment", "inappropriate", "misinformation", "other"],
    },
    details: { type: String, trim: true, maxlength: 280 },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

// File de modération
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

export type Report = InferSchemaType<typeof reportSchema>;
export const ReportModel = model("Report", reportSchema);
