const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/vislides")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

const Question = require("./models/Question");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const sessionRoutes = require("./routes/sessions");
app.use("/sessions", sessionRoutes);

// ----------------- SOCKET.IO -----------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
    console.log(`User joined session ${sessionId}`);
  });

  socket.on("new_question", (q) => {
  if (!q || !q.sessionId) {
    console.error("Invalid question object received:", q);
    return;
  }

  const { sessionId } = q;
  console.log(`Broadcasting question to session ${sessionId}`);
  io.to(sessionId).emit("new_question", q);
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ----------------- CREATE QUESTION -----------------
// ----------------- CREATE QUESTION -----------------
app.post("/api/questions", async (req, res) => {
  const { sessionId, userId, text, anonymous } = req.body;

  // Validate required fields
  if (!sessionId || !text) {
    return res.status(400).json({ error: "sessionId and text are required" });
  }

  try {
    // Create and save the question in MongoDB
    const question = await Question.create({
      sessionId,
      userId,
      text,
      anonymous: anonymous ?? true, // default true
    });

    // Broadcast to all sockets in that session
    io.to(sessionId).emit("new_question", question);

    // Respond to the frontend
    res.status(201).json({ success: true, question });
  } catch (err) {
    console.error("Error saving question:", err);
    res.status(500).json({ success: false });
  }
});

// ----------------- CREATE SESSION -----------------
app.post("/sessions", (req, res) => {
  console.log("POST /sessions received:", req.body);
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code required" });
  res.json({ success: true, code });
});

// ----------------- GET QUESTIONS -----------------
app.get("/sessions/:sessionId/questions", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const questions = await Question.find({ sessionId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));