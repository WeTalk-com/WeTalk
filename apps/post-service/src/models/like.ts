import { Schema, model, type InferSchemaType } from "mongoose";

// Like = relation between User <=> Post
const likeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

// Prevents double-like
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type Like = InferSchemaType<typeof likeSchema>;
export const LikeModel = model("Like", likeSchema);
