import { Schema, model, type InferSchemaType } from "mongoose";

// Forme d'un post en base.
const postSchema = new Schema(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 280 },
    likedBy: { type: [String], default: [] }, // userIds ayant liké — count = longueur, likedByMe = includes(me)
  },
  { timestamps: true },
);

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = model("Post", postSchema);
