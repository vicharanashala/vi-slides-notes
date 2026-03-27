import { Server, Socket } from "socket.io";
import http from "http";
import classModel from "../models/class.model";
import { socketAuth } from "./socketAuth";

let io: Server;

// Store questions per class
const classQuestions = new Map<string, any[]>();

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // ---------------- JOIN CLASS ROOM (MERGED) ----------------
    socket.on("join_class_room", async ({ classId }) => {
      try {
        const user = socket.data.user;

        // Prevent duplicate join
        if (socket.rooms.has(classId)) {
          console.log(`User ${user._id} already in room ${classId}`);
          return;
        }

        const classObj = await classModel.findById(classId);
        if (!classObj) {
          return socket.emit("error", "Class not found");
        }

        const isInstructor =
          classObj.instructor.toString() === user._id.toString();

        const isParticipant = classObj.participants.some(
          (id) => id.toString() === user._id.toString()
        );

        if (!isInstructor && !isParticipant) {
          return socket.emit("error", "Not authorized");
        }

        if (!classObj.isLive) {
          return socket.emit("error", "Class not live");
        }

        // Join room
        socket.join(classId);
        socket.data.classId = classId;

        console.log(`User ${user._id} joined class ${classId}`);

        // INIT QUESTIONS ARRAY
        if (!classQuestions.has(classId)) {
          classQuestions.set(classId, []);
        }

        // SEND EXISTING QUESTIONS TO NEW USER
        socket.emit("all_questions", classQuestions.get(classId));

        // Notify others
        socket.to(classId).emit("user_joined", {
          userId: user._id,
        });

      } catch (err) {
        console.error("Join error:", err);
        socket.emit("error", "Internal server error");
      }
    });

    // ---------------- ASK QUESTION ----------------
    socket.on("ask_question", ({ classId, question }) => {
      const user = socket.data.user;

      if (!classQuestions.has(classId)) return;

      const questions = classQuestions.get(classId)!;

      const newQuestion = {
        id: Date.now(),
        question,
        studentId: user._id,
        answer: null,
      };

      questions.push(newQuestion);

      io.to(classId).emit("new_question", newQuestion);
    });

    // ---------------- ANSWER QUESTION ----------------
    socket.on("answer_question", ({ classId, questionId, answer }) => {
      const user = socket.data.user;

      if (user.role !== "Instructor") {
        return socket.emit("error", "Only instructor can answer");
      }

      const questions = classQuestions.get(classId);
      if (!questions) return;

      const updated = questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      );

      classQuestions.set(classId, updated);

      io.to(classId).emit("question_answered", {
        questionId,
        answer,
      });
    });

    // ---------------- END CLASS ----------------
    socket.on("end_class", async ({ classId }) => {
      try {
        const user = socket.data.user;

        if (user.role !== "Instructor") {
          return socket.emit("error", "Only instructor can end class");
        }

        const classObj = await classModel.findById(classId);

        if (
          !classObj ||
          classObj.instructor.toString() !== user._id.toString()
        ) {
          return socket.emit("error", "Not authorized");
        }

        // Update DB
        classObj.isLive = false;
        await classObj.save();

        // Notify all users
        io.to(classId).emit("class_ended", { classId });

        // Force leave room
        const sockets = await io.in(classId).fetchSockets();

        sockets.forEach((s) => {
          s.leave(classId);
          s.data.classId = null;
        });

        // Clear memory
        classQuestions.delete(classId);

        console.log(`Class ${classId} ended`);

      } catch (err) {
        console.error("End class error:", err);
        socket.emit("error", "Internal server error");
      }
    });

    // ---------------- SHARE FILE ----------------
    socket.on("share_file", ({ classId, file }) => {
      io.to(classId).emit("new_file_shared", file);
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", () => {
      const { user, classId } = socket.data;

      if (user && classId) {
        socket.to(classId).emit("user_left", {
          userId: user._id,
        });
      }

      console.log("Disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};