import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  text: string;
  status: "pending" | "answered";
  answer?: string;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["pending", "answered"], default: "pending" },
    answer: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
