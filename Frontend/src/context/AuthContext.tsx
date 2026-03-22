import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  updateUserAccount,
  type User,
  type LoginData,
  type RegisterData,
  type UpdateUserData,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on app load via cookie
  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: LoginData) => {
    const res = await loginUser(data);
    setUser(res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await registerUser(data);
    setUser(res.data.user);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = async (data: UpdateUserData) => {
    const res = await updateUserAccount(data);
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};