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
export const getAssignments = () =>
  api.get<AssignmentsResponse>("/assignments");
export const getSingleAssignment = (id: string) =>
  api.get<AssignmentResponse>(`/assignments/${id}`);
export const submitAssignment = (id: string, fileUrl: string) =>
  api.post<SubmitResponse>(`/assignments/${id}/submit`, { fileUrl });

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