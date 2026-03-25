import { Request, Response } from "express";
import assignmentModel from "../models/assignment.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ------------------- CREATE -------------------
export const createAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, dueDate, maxMarks } = req.body;

    const assignment = await assignmentModel.create({
      title,
      description,
      dueDate,
      maxMarks,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: "Assignment created",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET ALL -------------------
export const getAssignments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const assignments = await assignmentModel
      .find()
      .populate("createdBy", "fullname email")
      .populate("submissions.student", "fullname email");

    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET ONE (optional but useful) -------------------
export const getSingleAssignment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const assignment = await assignmentModel
      .findById(id)
      .populate("createdBy", "fullname email")
      .populate("submissions.student", "fullname email");

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    res.status(200).json({ assignment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- UPDATE -------------------
export const updateAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, maxMarks } = req.body;

    const assignment = await assignmentModel.findById(id);

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (maxMarks !== undefined) assignment.maxMarks = maxMarks;

    await assignment.save();

    res.status(200).json({
      message: "Assignment updated",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- DELETE -------------------
export const deleteAssignment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const assignment = await assignmentModel.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    res.status(200).json({
      message: "Assignment deleted",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- SUBMIT -------------------
export const submitAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body;

    const assignment = await assignmentModel.findById(id);

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    // prevent duplicate submission
    const alreadySubmitted = assignment.submissions.find(
      (s) => s.student.toString() === req.user?._id.toString()
    );

    if (alreadySubmitted) {
      res.status(400).json({ message: "Already submitted" });
      return;
    }

    assignment.submissions.push({
      student: req.user?._id,
      fileUrl,
      submittedAt: new Date(),
    });

    await assignment.save();

    res.status(200).json({
      message: "Assignment submitted successfully",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
//Get all submissions
export const getAllSubmissions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const assignments = await assignmentModel
      .find()
      .populate("submissions.student", "fullname email")
      .select("title submissions");

    const allSubmissions = assignments.flatMap((assignment) =>
      assignment.submissions.map((submission) => ({
        assignmentTitle: assignment.title,
        student: submission.student,
        fileUrl: submission.fileUrl,
        submittedAt: submission.submittedAt,
      }))
    );

    res.status(200).json({ submissions: allSubmissions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};