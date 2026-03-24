import { Request } from 'express';
import { IUser } from '../models/User';

declare namespace Express {
  interface Request {
    user?: any;
  }
}