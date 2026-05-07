import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import cors from "cors";
import passport from "passport";
import connectDB from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";

const app = express();
const googleAuthEnabled = configurePassport();



app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.set("googleAuthEnabled", googleAuthEnabled);


app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);


app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Vi-SlideS Backend is running", googleAuthEnabled });
});


connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Vi-SlideS server running on port ${PORT}`);
});
