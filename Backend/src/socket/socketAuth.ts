import { Socket, ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
import * as cookie from "cookie";

interface JwtPayload {
  _id: string;
}

export const socketAuth = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    if (!process.env.JWT_SECRET) {
      return next(new Error("Server config error"));
    }

    const rawCookie = socket.handshake.headers.cookie || "";
    const parsedCookies = cookie.parse(rawCookie);

    const authHeader = socket.handshake.auth?.token;

    const token = parsedCookies.token
      ? decodeURIComponent(parsedCookies.token)
      : authHeader || null;

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    const user = await userModel
      .findById(decoded._id)
      .select("-password");

    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    socket.data.user = user;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err);
    next(new Error("Unauthorized: Invalid or expired token"));
  }
};