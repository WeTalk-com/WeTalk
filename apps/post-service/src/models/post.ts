import { Schema, model, type InferSchemaType } from "mongoose";

// Forme d'un post en base.
const postSchema = new Schema(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 280 },
    // TODO(Fx12): add `tags: [String]` field with index for tag-based search (Fx13).
    // TODO(Fx18/Fx19): add `media: [{ url, type }]` field for images/videos (needs storage decision: S3/MinIO).
  },
  { timestamps: true },
);

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = model("Post", postSchema);
