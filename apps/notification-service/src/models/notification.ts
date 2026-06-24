import mongoose, { type Document, type Model, type SchemaTimestampsConfig } from "mongoose";

export type NotificationType = "like" | "comment" | "follow";

export interface INotification extends Document, SchemaTimestampsConfig {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  preview?: string;
  read: boolean;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    type: { type: String, enum: ["like", "comment", "follow"], required: true },
    postId: String,
    commentId: String,
    preview: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.model<INotification>("Notification", notificationSchema);
