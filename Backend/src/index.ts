// ------------------- DNS FIX (for MongoDB on hotspot) -------------------
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ------------------- ENV CONFIG -------------------
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

// ------------------- IMPORTS -------------------
import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import assignmentRouter from "./routes/assignment.route";
import classRouter from "./routes/class.route";
import authRouter from "./routes/auth.route";
import aiRouter from "./routes/ai.route";

import connectDB from "./config/db";

import http from "http";
import { initSocket } from "./socket/socket";

// ------------------- APP INIT -------------------
const app: Application = express();

// create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with server
initSocket(server);

// ------------------- DB CONNECTION -------------------
connectDB();

// ------------------- CORS -------------------
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

// ------------------- MIDDLEWARE -------------------
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------- ROUTES -------------------
app.use("/api/auth", authRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/class", classRouter);
app.use("/api/ai", aiRouter);

// ------------------- HEALTH CHECK -------------------
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server + Socket running on port ${PORT}`);
});