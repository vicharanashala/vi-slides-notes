import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
    </div>
  );

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default PublicRoute;