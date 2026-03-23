import mongoose, { Schema, Document, Model } from "mongoose";

// ------------------- INTERFACE -------------------
export interface IClass extends Document {
  title: string;
  instructor: mongoose.Types.ObjectId;
  classCode: string;
  isLive: boolean;
  createdAt: Date;
}

// ------------------- SCHEMA -------------------
const classSchema: Schema<IClass> = new Schema(
  {
    title: { type: String, required: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    classCode: { type: String, required: true, unique: true },
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ------------------- MODEL -------------------
const classModel: Model<IClass> = mongoose.model<IClass>(
  "class",
  classSchema
);

export default classModel;