import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  question:    string;
  sessionId:   Types.ObjectId;
  authorId?:   Types.ObjectId;
  isAnonymous: boolean;
  answer?:     string;
  answerType?: "manual" | "ai";
  repliedBy?:  Types.ObjectId;
  repliedAt?:  Date;
  isPinned:    boolean;
  createdAt?:  Date;
  updatedAt?:  Date;
}

const questionSchema = new Schema<IQuestion>({
  question:    { type: String, required: true },
  sessionId:   { type: Schema.Types.ObjectId, ref: "Session", required: true },
  authorId:    { type: Schema.Types.ObjectId, ref: "User" },
  isAnonymous: { type: Boolean, default: false },
  answer:      { type: String },
  answerType:  { type: String, enum: ["manual", "ai"] },
  repliedBy:   { type: Schema.Types.ObjectId, ref: "User" },
  repliedAt:   { type: Date },
  isPinned:    { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.model<IQuestion>("Question", questionSchema);