import { Server } from "socket.io";
import http from "http";
import User from "../models/User";

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};