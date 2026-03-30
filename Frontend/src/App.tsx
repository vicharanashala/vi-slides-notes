import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "next-themes";
import Dashboard from "./pages/Dashboard";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Assignment from "./pages/StudentAssignments";
import AssignmentDetail from "./pages/StudentAssignmentDetail";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherAssignmentDetail from "./pages/TeacherAssignmentDetail";
import EditProfile from "./pages/EditProfile";
import SessionPage from "./pages/SessionPage";
import TeacherAssignmentEdit from "./pages/TeacherAssignmentEdit";
import TodoPage from "./pages/todo-page";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment"
            element={
              <ProtectedRoute>
                <Assignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment/:id"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <TeacherAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute>
                <TeacherAssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:classId"
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/edit/:id"
            element={
              <ProtectedRoute>
                <TeacherAssignmentEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
