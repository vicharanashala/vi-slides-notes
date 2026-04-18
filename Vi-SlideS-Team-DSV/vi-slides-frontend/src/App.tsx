import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SessionTeacherView from './pages/SessionTeacherView';
import SessionStudentView from './pages/SessionStudentView';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher-session/:code" element={<SessionTeacherView />} />
          <Route path="/session/:code" element={<SessionStudentView />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}