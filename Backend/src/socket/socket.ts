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

    // ---------------- JOIN CLASS ROOM ----------------
    socket.on("join_class_room", async ({ classId }) => {
      try {
        const user = socket.data.user;

        if (socket.rooms.has(classId)) {
          console.log(`User ${user._id} already in room ${classId}`);
          return;
        }

        const classObj = await classModel.findById(classId);
        if (!classObj) {
          return socket.emit("error", "Class not found");
        }

        const isInstructor = classObj.instructor.toString() === user._id.toString();
        const isParticipant = classObj.participants.some(
          (id) => id.toString() === user._id.toString()
        );

        if (!isInstructor && !isParticipant) {
          return socket.emit("error", "Not authorized");
        }

        if (!classObj.isLive) {
          return socket.emit("error", "Class not live");
        }

        socket.join(classId);
        socket.data.classId = classId;

        console.log(`User ${user._id} joined class ${classId}`);

        if (!classQuestions.has(classId)) {
          classQuestions.set(classId, []);
        }

        socket.emit("all_questions", classQuestions.get(classId));

        socket.to(classId).emit("user_joined", {
          userId: user._id,
        });

        // Notify teacher that a student joined (for initial WebRTC setup)
        if (user.role !== "Instructor") {
          socket.to(classId).emit("student_joined", {
            studentId: socket.id,
          });
        }
      } catch (err) {
        console.error("Join error:", err);
        socket.emit("error", "Internal server error");
      }
    });

    // ---------------- 📺 SCREEN SHARE & RENEGOTIATION ----------------

    socket.on("class_started", ({ classId }) => {
      // 1. Notify students that the UI should show the video container
      socket.to(classId).emit("class_started");

      // 2. CRITICAL: Ask all students in the room to "re-join" the WebRTC flow
      // This forces the 'student_joined' logic on the teacher's frontend for everyone currently present.
      socket.to(classId).emit("request_renegotiation", { teacherId: socket.id });
    });

    // Students respond to 'request_renegotiation' by emitting this
    socket.on("renegotiate_ready", ({ to }) => {
      io.to(to).emit("student_joined", {
        studentId: socket.id,
      });
    });

    socket.on("class_stopped", ({ classId }) => {
      socket.to(classId).emit("class_stopped");
    });

    // ---------------- 🧠 WEBRTC SIGNALING ----------------

    socket.on("webrtc_offer", ({ to, offer }) => {
      io.to(to).emit("webrtc_offer", {
        offer,
        from: socket.id,
      });
    });

    socket.on("webrtc_answer", ({ to, answer }) => {
      io.to(to).emit("webrtc_answer", {
        answer,
        from: socket.id,
      });
    });

    socket.on("webrtc_ice_candidate", ({ to, candidate }) => {
      if (to) {
        io.to(to).emit("webrtc_ice_candidate", {
          candidate,
          from: socket.id,
        });
      }
    });

    // ---------------- QUESTIONS & CLASS MGMT ----------------

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

    socket.on("end_class", async ({ classId }) => {
      try {
        const user = socket.data.user;
        if (user.role !== "Instructor") {
          return socket.emit("error", "Only instructor can end class");
        }

        const classObj = await classModel.findById(classId);
        if (!classObj || classObj.instructor.toString() !== user._id.toString()) {
          return socket.emit("error", "Not authorized");
        }

        classObj.isLive = false;
        await classObj.save();

        io.to(classId).emit("class_ended", { classId });

        const sockets = await io.in(classId).fetchSockets();
        sockets.forEach((s) => {
          s.leave(classId);
          s.data.classId = null;
        });

        classQuestions.delete(classId);
        console.log(`Class ${classId} ended`);
      } catch (err) {
        console.error("End class error:", err);
        socket.emit("error", "Internal server error");
      }
    });

    socket.on("share_file", ({ classId, file }) => {
      io.to(classId).emit("new_file_shared", file);
    });

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