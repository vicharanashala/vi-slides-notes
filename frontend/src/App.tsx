import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import TeacherAuth from './pages/TeacherAuth';
import Dashboard from './pages/Dashboard';
import ActiveSession from './pages/ActiveSession';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import JoinClassDashboard from './pages/JoinClassDashboard';
import StudentSession from './pages/StudentSession';
import SessionSummary from './pages/SessionSummary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher-login" element={<TeacherAuth />} />
        <Route path="/teacher-dashboard" element={<Dashboard />} />
        <Route path="/teacher-session/:code" element={<ActiveSession />} />
        <Route path="/summary/:code" element={<SessionSummary />} />
        
        {/* Student Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/join-class" element={<JoinClassDashboard />} />
        <Route path="/student-session/:code" element={<StudentSession />} />

        {/* Fallback for unmatched routes like the old /dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;