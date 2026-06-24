import { Schema, model, type InferSchemaType } from "mongoose";

// Forme d'un post en DB
const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true, enum: ["image", "video"] },
  },
  { _id: false },
);

const postSchema = new Schema(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 280 },
    likedBy: { type: [String], default: [] }, // userIds ayant liké — count = longueur, likedByMe = includes(me)
    tags: { type: [String], default: [], index: true }, // #hashtags extraits du content à la création, lowercase
    media: { type: mediaSchema, required: false, default: undefined },
  },
  { timestamps: true },
);

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = model("Post", postSchema);
