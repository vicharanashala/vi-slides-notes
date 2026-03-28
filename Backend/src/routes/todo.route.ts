import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo
} from "../controllers/todo.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getTodos);             
router.post("/", createTodo);         
router.get("/:id", getTodo);           
router.put("/:id", updateTodo);        
router.delete("/:id", deleteTodo);      

export default router;