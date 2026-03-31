import { IUser } from "../models/User";

// Extend Express Request so middleware/controllers can safely use req.user.
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

export {};
