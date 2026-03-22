import { Request, Response } from "express";
import assignmentModel from "../models/assignment.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ------------------- CREATE ASSIGNMENT -------------------
export const createAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body;

    const instructorId = req.user?._id;

    // Role check
    if (req.user.role !== "Instructor") {
      res.status(403).json({
        message: "Only instructors can create assignments",
      });
      return;
    }

    const assignment = await assignmentModel.create({
      title,
      description,
      instructor: instructorId,
    });

    res.status(201).json({
      message: "Assignment created",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET ALL ASSIGNMENTS -------------------
export const getAssignments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const assignments = await assignmentModel
      .find()
      .populate("instructor", "fullname email");

    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- DELETE ASSIGNMENT -------------------
export const deleteAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Role check
    if (req.user.role !== "Instructor") {
      res.status(403).json({
        message: "Only instructors can delete assignments",
      });
      return;
    }

    const assignment = await assignmentModel.findById(id);

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    // Ownership check
    if (assignment.instructor.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "Not allowed" });
      return;
    }

    await assignment.deleteOne();

    res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- UPDATE ASSIGNMENT -------------------
export const updateAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Role check
    if (req.user.role !== "Instructor") {
      res.status(403).json({
        message: "Only instructors can update assignments",
      });
      return;
    }

    const assignment = await assignmentModel.findById(id);

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    // Ownership check
    if (assignment.instructor.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "Not allowed" });
      return;
    }

    // Update fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;

    await assignment.save();

    res.status(200).json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};