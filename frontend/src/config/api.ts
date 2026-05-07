type ApiEnvKey =
  | "VITE_API_AUTH_LOGIN"
  | "VITE_API_AUTH_REGISTER"
  | "VITE_API_AUTH_GOOGLE_START"
  | "VITE_API_AUTH_GOOGLE_STATUS"
  | "VITE_API_AUTH_ROLE"
  | "VITE_API_QUESTIONS_SUBMIT"
  | "VITE_API_QUESTIONS_BY_SESSION"
  | "VITE_API_SESSIONS"
  | "VITE_API_SESSIONS_MINE"
  | "VITE_API_SESSION_STATUS"
  | "VITE_API_SESSION_DELETE"
  | "VITE_API_QUESTION_ANSWER"
  | "VITE_API_QUESTION_ANSWER_AI"
  | "VITE_API_QUESTION_PIN";

const readApiEnv = (key: ApiEnvKey): string => {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is not defined in frontend/.env`);
  }

  return value;
};

export const API_ENDPOINTS = Object.freeze({
  authLogin: readApiEnv("VITE_API_AUTH_LOGIN"),
  authRegister: readApiEnv("VITE_API_AUTH_REGISTER"),
  authGoogleStart: readApiEnv("VITE_API_AUTH_GOOGLE_START"),
  authGoogleStatus: readApiEnv("VITE_API_AUTH_GOOGLE_STATUS"),
  authRole: readApiEnv("VITE_API_AUTH_ROLE"),
  submitQuestion: readApiEnv("VITE_API_QUESTIONS_SUBMIT"),
  questionsBySession: readApiEnv("VITE_API_QUESTIONS_BY_SESSION"),
  sessions: readApiEnv("VITE_API_SESSIONS"),
  sessionsMine: readApiEnv("VITE_API_SESSIONS_MINE"),
  sessionStatus: readApiEnv("VITE_API_SESSION_STATUS"),
  sessionDelete: readApiEnv("VITE_API_SESSION_DELETE"),
  questionAnswer: readApiEnv("VITE_API_QUESTION_ANSWER"),
  questionAnswerAI: readApiEnv("VITE_API_QUESTION_ANSWER_AI"),
  questionPin: readApiEnv("VITE_API_QUESTION_PIN"),
});

export const fillPathParam = (
  template: string,
  paramName: string,
  value: string
): string => {
  return template.replace(`:${paramName}`, encodeURIComponent(value));
};
