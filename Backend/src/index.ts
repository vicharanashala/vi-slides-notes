// this is for secure mongodb connection for people using mobile hotspot
// it will use google dns servers instead of the default ones which may not work properly with mobile hotspots
import dns from 'dns';
import dotenv from "dotenv";
import path from 'path';


dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '.env') });




import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import assignmentRouter from "./routes/assignment.route";
import classRouter from "./routes/class.route";

import connectDB from "./config/db";
import authRouter from "./routes/auth.route";

// Load env variables
dotenv.config();

const app: Application = express();

// Connect Database
connectDB();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/class", classRouter);

// Health check 
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});