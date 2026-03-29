import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
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

export const reconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.connect();
  }
};