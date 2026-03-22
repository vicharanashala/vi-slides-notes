import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema: Schema<IAssignment> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const assignmentModel: Model<IAssignment> = mongoose.model(
  "assignment",
  assignmentSchema
);

export default assignmentModel;