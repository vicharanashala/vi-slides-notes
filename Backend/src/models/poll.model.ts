import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPoll extends Document {
  classId: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  responses: {
    userId: mongoose.Types.ObjectId;
    selectedOption: number; // index of option
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // instructor ID
  createdAt: Date;
}

const pollSchema: Schema<IPoll> = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    responses: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        selectedOption: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const pollModel: Model<IPoll> = mongoose.model<IPoll>("poll", pollSchema);
export default pollModel;