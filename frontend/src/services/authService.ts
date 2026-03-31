import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Teacher" | "Student";
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface GoogleAuthData {
  token: string;
  intent: "student_login" | "teacher_signup";
  teacherId?: string;
}

export const authService = {
  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateDetails: async (data: {
    name: string;
    email: string;
  }): Promise<{ success: boolean; user: User }> => {
    const response = await api.put("/auth/updatedetails", data);
    return response.data;
  },

  googleLogin: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", data);
    return response.data;
  },
};
