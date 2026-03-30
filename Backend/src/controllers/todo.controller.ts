import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";


const mapToFrontend = (todo: any) => ({
  _id: todo._id,
  title: todo.title,
  description: todo.description,
  dueDate: todo.dueDate,
  completed: todo.completed,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
});

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate } = req.body;
    const todo = await todoModel.create({
      user: req.user._id,
      title,
      description,
      dueDate,
    });
    res.status(201).json(mapToFrontend(todo));
  } catch (err) {
    res.status(500).json({ message: "Error creating todo" });
  }
};

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const todos = await todoModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      todos: todos.map(mapToFrontend),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching todos" });
  }
};

export const getTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await todoModel.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(mapToFrontend(todo));
  } catch (err) {
    res.status(500).json({ message: "Error fetching todo" });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {

    const update = { ...req.body };
   
    const todo = await todoModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(mapToFrontend(todo));
  } catch (err) {
    res.status(500).json({ message: "Error updating todo" });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await todoModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting todo" });
  }
};