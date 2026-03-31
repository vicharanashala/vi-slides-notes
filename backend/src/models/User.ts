import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "Teacher" | "Student";
  googleId?: string;
  teacherId?: string;
  teacherVerified?: boolean;
  avatar?: string;
  points: number;
  bookmarks: {
    sessionTitle: string;
    sessionCode: string;
    timestamp: Date;
  }[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["Teacher", "Student"],
    default: "Student",
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined values to be unique (though unique index ignores null usually, sparse is safer)
  },
  teacherId: {
    type: String,
    trim: true,
  },
  teacherVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
  },
  points: {
    type: Number,
    default: 0,
  },
  bookmarks: [
    {
      sessionTitle: String,
      sessionCode: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
