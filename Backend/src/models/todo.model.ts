import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITodo extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  // You may keep extra fields for future use:
  status?: "pending" | "in_progress" | "completed";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema: Schema<ITodo> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    // Extra properties preserved:
    status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const todoModel: Model<ITodo> = mongoose.model<ITodo>("todo", todoSchema);

export default todoModel;