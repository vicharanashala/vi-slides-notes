import express from "express";
import { submitQuestion } from "../controllers/questionController";

const router = express.Router();

router.post("/submit", submitQuestion);

export default router;