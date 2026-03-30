import axios from "axios";

// -------- AUTH TYPES --------
export interface LoginData {
  email: string;
  password: string;
}
export interface RegisterData {
  fullname: string;
  email: string;
  password: string;
  role: string;
}
export interface UpdateUserData {
  fullname?: string;
  oldPassword?: string;
  newPassword?: string;
}
export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
export interface AuthResponse {
  message: string;
  user: User;
}
export interface GetUserResponse {
  user: User | null;
}
export interface LogoutResponse {
  message: string;
}
export interface UpdateUserResponse {
  message: string;
  user: User;
}

// -------- ASSIGNMENT TYPES --------
export interface Submission {
  student: { _id: string; fullname: string; email: string };
  fileUrl: string;
  submittedAt: string;
}
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  createdBy: { _id: string; fullname: string; email: string };
  submissions: Submission[];
  createdAt: string;
  updatedAt: string;
}
export interface AssignmentsResponse {
  assignments: Assignment[];
}
export interface AssignmentResponse {
  assignment: Assignment;
}
export interface SubmitResponse {
  message: string;
  assignment: Assignment;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
}
export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  dueDate?: string;
  maxMarks?: number;
}
export interface DeleteAssignmentResponse {
  message: string;
}
export interface AllSubmission {
  assignmentTitle: string;
  student: { fullname: string; email: string };
  fileUrl: string;
  submittedAt: string;
}

export interface AllSubmissionsResponse {
  Submissions: AllSubmission[];
}

// -------- CLASS TYPES --------
export interface Class {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    fullname: string;
    email: string;
  };
  classCode: string;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassResponse {
  success: boolean;
  data: Class;
}

export interface StartEndClassResponse {
  message: string;
  data: Class;
}

export interface JoinClassResponse {
  success: boolean;
  message: string;
  classId: string;
}

export interface GetClassResponse {
  _id: string;
  title: string;
  instructor: string;
  classCode: string;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AllSubmissionsResponse {
  submissions: {
    assignmentTitle: string;
    student: { fullname: string; email: string };
    fileUrl: string;
    submittedAt: string;
  }[];
}

// -------- TODO TYPES --------
export interface Todo {
  _id: string;
  title: string;
  description: string;
  dueDate: string;   
  completed: boolean; 
  createdAt: string;
  updatedAt: string;
}

export interface TodosResponse {
  todos: Todo[];
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

// -------- AI TYPES --------
export interface AIAnswerResponse {
  answer: string;
}

// -------- AXIOS INSTANCE --------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// -------- INTERCEPTORS --------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired");
    }
    return Promise.reject(error);
  }
);

// -------- AUTH --------
export const registerUser = (data: RegisterData) =>
  api.post<AuthResponse>("/auth/register", data);
export const loginUser = (data: LoginData) =>
  api.post<AuthResponse>("/auth/login", data);
export const logoutUser = () =>
  api.get<LogoutResponse>("/auth/logout");
export const getCurrentUser = () =>
  api.get<GetUserResponse>("/auth/user");
export const updateUserAccount = (data: UpdateUserData) =>
  api.put<UpdateUserResponse>("/auth/user/update", data);

// -------- ASSIGNMENTS --------
// (both specific)
export const getAssignments = () =>
  api.get<AssignmentsResponse>("/assignments");
export const getSingleAssignment = (id: string) =>
  api.get<AssignmentResponse>(`/assignments/${id}`);

// (Student specific)
export const submitAssignment = (id: string, fileUrl: string) =>
  api.post<SubmitResponse>(`/assignments/${id}/submit`, { fileUrl });

// (Instructor specific)
export const createAssignment = (data: CreateAssignmentData) =>
  api.post<AssignmentResponse>("/assignments", data);
export const updateAssignment = (id: string, data: UpdateAssignmentData) =>
  api.put<AssignmentResponse>(`/assignments/${id}`, data);
export const deleteAssignment = (id: string) =>
  api.delete<DeleteAssignmentResponse>(`/assignments/${id}`);
export const getAllSubmissions = () =>
  api.get<AllSubmissionsResponse>("/assignments/submissions/all");
export default api;

// -------- CLASS --------

// (Instructor)
export const createClass = (title: string) =>
  api.post<CreateClassResponse>("/class/create", { title });
export const startClass = (classId: string) =>
  api.post<StartEndClassResponse>(`/class/${classId}/start`);
export const endClass = (classId: string) =>
  api.post<StartEndClassResponse>(`/class/${classId}/end`);

// -------- STUDENT --------

export const joinClass = (classCode: string) =>
  api.post<JoinClassResponse>("/class/join", { classCode });

// -------- COMMON --------

export const getClassById = (id: string) =>
  api.get<GetClassResponse>(`/class/${id}`);

export const getClassByCode = (code: string) =>
  api.get<GetClassResponse>(`/class/code/${code}`);

// -------- TODOS --------
export const getTodos = () =>
  api.get<TodosResponse>("/todos");

export const createTodo = (data: CreateTodoRequest) =>
  api.post<Todo>("/todos", data);

export const updateTodo = (id: string, data: UpdateTodoRequest) =>
  api.put<Todo>(`/todos/${id}`, data);

export const deleteTodo = (id: string) =>
  api.delete<{ message: string }>(`/todos/${id}`);

// ---------------Ask AI----------------
export const getAIAnswer = (question: string) => {
  return api.post<AIAnswerResponse>("/ai/answer", { question });
};
