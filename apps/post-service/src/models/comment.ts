import { Schema, model, type InferSchemaType } from "mongoose";

// Commentaire d'un post. parentId non-null = réponse à un autre commentaire (1 niveau).
const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 280 },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    likedBy: { type: [String], default: [] }, // mêmes sémantiques que sur le post
  },
  { timestamps: true },
);

export type Comment = InferSchemaType<typeof commentSchema>;
export const CommentModel = model("Comment", commentSchema);
