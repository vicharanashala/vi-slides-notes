import QuestionModel from "../models/Question";

export interface CreateQuestionDTO {
  text: string;
  sessionId: string;
  userId: string;
  userName: string;
}

export const createQuestion = async (data: CreateQuestionDTO) => {
  const question = await QuestionModel.create({
    text: data.text,
    sessionId: data.sessionId,
    userId: data.userId,
    userName: data.userName,
    createdAt: new Date(),
  });

  return question;
};

export const getQuestionsBySession = async (sessionId: string) => {
  const questions = await QuestionModel.find({ sessionId })
    .sort({ createdAt: -1 })
    .lean();

  return questions;
};