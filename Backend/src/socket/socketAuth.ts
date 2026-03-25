import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";

export const socketAuth = async (socket: Socket, next: any) => {
  try {
    let rawToken = socket.handshake.auth?.token;

    // Normalize token
    if (Array.isArray(rawToken)) {
      rawToken = rawToken[0];
    }

    // Validate
    if (!rawToken || typeof rawToken !== "string") {
      return next(new Error("Unauthorized: No token"));
    }

    const token: string = rawToken;

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const user = await userModel
      .findById(decoded.id || decoded._id)
      .select("-password");

    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    socket.data.user = user;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};