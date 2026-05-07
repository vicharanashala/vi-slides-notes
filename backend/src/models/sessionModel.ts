import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  title:  string;
  code:   string;
  status: string;
  teacherId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionSchema = new Schema<ISession>({
  title:  { type: String, required: true },
  code:   { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  timestamps: true,
});

export default mongoose.model<ISession>("Session", sessionSchema);