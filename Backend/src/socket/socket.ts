import { Server, Socket } from "socket.io";
import http from "http";
import classModel from "../models/class.model";
import { socketAuth } from "./socketAuth";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Apply auth middleware
  io.use(socketAuth);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // ---------------- JOIN CLASS ROOM ----------------
    socket.on("join_class_room", async ({ classId }) => {
      try {
        const user = socket.data.user;
        if (socket.rooms.has(classId)) {
          // skip if already joined
          console.log(`User ${user._id} already in room ${classId}, skipping`);
          return;
        }
        const classObj = await classModel.findById(classId);

        if (!classObj) {
          return socket.emit("error", "Class not found");
        }

        // Check instructor OR participant
        const isInstructor =
          classObj.instructor.toString() === user._id.toString();

        const isParticipant = classObj.participants.some(
          (id) => id.toString() === user._id.toString(),
        );

        if (!isInstructor && !isParticipant) {
          return socket.emit("error", "Not authorized");
        }

        // Check if class is live
        if (!classObj.isLive) {
          return socket.emit("error", "Class not live");
        }

        // Join room
        socket.join(classId);

        socket.data.classId = classId;

        console.log(`User ${user._id} joined class ${classId}`);

        socket.to(classId).emit("user_joined", {
          userId: user._id,
        });
      } catch (err) {
        console.log("Join error:", err);
        socket.emit("error", "Internal server error");
      }
    });

    // ---------------- START CLASS ----------------
    socket.on("start_class", async ({ classId }) => {
      const user = socket.data.user;

      if (user.role !== "Instructor") {
        return socket.emit("error", "Only instructor can start class");
      }

      // Verify ownership before broadcasting
      const classObj = await classModel.findById(classId);
      if (!classObj || classObj.instructor.toString() !== user._id.toString()) {
        return socket.emit("error", "Not authorized");
      }

      socket.to(classId).emit("class_started", { classId });
    });

    // ---------------- END CLASS ----------------
    socket.on("end_class", async ({ classId }) => {
      const user = socket.data.user;

      if (user.role !== "Instructor") {
        return socket.emit("error", "Only instructor can end class");
      }

      const classObj = await classModel.findById(classId);

      if (!classObj || classObj.instructor.toString() !== user._id.toString()) {
        return socket.emit("error", "Not authorized");
      }

      // Update DB
      classObj.isLive = false;
      await classObj.save();

      // Notify all users
      io.to(classId).emit("class_ended", { classId });

      // 🔥 Force everyone to leave room
      const sockets = await io.in(classId).fetchSockets();

      sockets.forEach((s) => {
        s.leave(classId);
        s.data.classId = null;
      });

      console.log(`Class ${classId} ended, all users removed`);
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
