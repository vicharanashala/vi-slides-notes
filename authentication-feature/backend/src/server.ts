import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";

//  Load env
dotenv.config({ path: "./.env" });

//  Init app
const app = express();

//  Connect DB
connectDB();

//  Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

//  Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server running successfully ",
  });
});

// Root test
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running ");
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//  Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});