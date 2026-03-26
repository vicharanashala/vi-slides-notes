import { Response } from "express";
import classModel from "../models/class.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { getIO } from "../socket/socket";

// ------------------- CLASS CODE GENERATOR -------------------
const generateClassCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ------------------- CREATE CLASS -------------------
export const createClass = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "Instructor") {
      return res.status(403).json({
        message: "Only instructors can create classes",
      });
    }

    const { title } = req.body;

    let classCode: string;
    let exists;

    do {
      classCode = generateClassCode();
      exists = await classModel.findOne({ classCode });
    } while (exists);

    const newClass = await classModel.create({
      title,
      instructor: req.user._id,
      classCode,
      isLive: false,
      participants: [],
    });

    res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating class" });
  }
};

// ------------------- START CLASS -------------------
export const startClass = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;

    const classObj = await classModel.findById(classId);

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (req.user.role !== "Instructor") {
      return res.status(403).json({
        message: "Only instructors can start class",
      });
    }

    if (classObj.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your class" });
    }

    // Prevent duplicate start
    if (classObj.isLive) {
      return res.status(400).json({ message: "Class already live" });
    }

    classObj.isLive = true;
    await classObj.save();

    // 🔥 SOCKET SYNC
    const io = getIO();
    io.to(classId).emit("class_started", { classId });

    res.json({
      success: true,
      message: "Class started",
      data: classObj,
    });
  } catch (err) {
    res.status(500).json({ message: "Error starting class" });
  }
};

// ------------------- END CLASS -------------------
export const endClass = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params as { classId: string };

    const classObj = await classModel.findById(classId);

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (req.user.role !== "Instructor") {
      return res.status(403).json({
        message: "Only instructors can end class",
      });
    }

    if (classObj.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your class" });
    }

    if (!classObj.isLive) {
      return res.status(400).json({ message: "Class already ended" });
    }

    classObj.isLive = false;

    classObj.participants = [];

    await classObj.save();

    const io = getIO();

    // Notify all users
    io.to(classId).emit("class_ended", { classId });

    // 🔥 Force all sockets to leave room
    const sockets = await io.in(classId).fetchSockets();

    sockets.forEach((s) => {
      s.leave(classId);
      s.data.classId = null;
    });

    res.json({
      success: true,
      message: "Class ended",
      data: classObj,
    });
  } catch (err) {
    console.error("End class error:", err);
    res.status(500).json({ message: "Error ending class" });
  }
};

// ------------------- JOIN CLASS -------------------
export const joinClass = async (req: AuthRequest, res: Response) => {
  try {
    const { classCode } = req.body;

    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students can join classes",
      });
    }

    const classObj = await classModel.findOne({ classCode });

    if (!classObj) {
      return res.status(404).json({ message: "Invalid class code" });
    }

    if (!classObj.isLive) {
      return res.status(400).json({ message: "Class is not live" });
    }

    const alreadyJoined = classObj.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      classObj.participants.push(req.user._id);
      await classObj.save();
    }

    res.json({
      success: true,
      message: "Joined successfully",
      classId: classObj._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Error joining class" });
  }
};

// ------------------- GET CLASS BY ID -------------------
export const getClassById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const classObj = await classModel.findById(id);

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classObj);
  } catch (err) {
    res.status(500).json({ message: "Error fetching class" });
  }
};