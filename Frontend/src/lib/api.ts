import axios from "axios";

// -------- TYPES --------
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
  email?: string;
  password?: string;
  role?: string;
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

export default api;