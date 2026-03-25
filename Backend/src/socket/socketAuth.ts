import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
import * as cookie from "cookie"; 

export const socketAuth = async (socket: Socket, next: any) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("Unauthorized: No cookies"));
    }

    // Parse cookies
    const parsedCookies = cookie.parse(rawCookie);

    // Extract and decode token
    const token = parsedCookies.token
      ? decodeURIComponent(parsedCookies.token)
      : null;

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    // Verify JWT
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    // Fetch user
    const user = await userModel
      .findById(decoded._id)
      .select("-password");

    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    // Attach user to socket
    socket.data.user = user;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err);
    next(new Error("Invalid token"));
  }
};