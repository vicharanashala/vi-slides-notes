import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
     
    });

    socket.on("connect", () => {
      console.log("Connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
    
  }

  return socket;
};