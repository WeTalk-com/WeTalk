import { Schema, model, type InferSchemaType } from "mongoose";

// Comment = post reply or other comment via parentId
const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 280 },
  },
  { timestamps: true },
);

export type Comment = InferSchemaType<typeof commentSchema>;
export const CommentModel = model("Comment", commentSchema);
