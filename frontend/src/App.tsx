import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import AuthPage from './pages/auth/AuthPage'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import StudentPage from './pages/dashboard/StudentPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'

type UserRole = 'teacher' | 'student'

const readAuthState = (): { token: string | null; role: UserRole | null } => {
  const token = localStorage.getItem('token')
  const roleRaw = localStorage.getItem('role')
  const role: UserRole | null = roleRaw === 'teacher' || roleRaw === 'student' ? roleRaw : null

  return { token, role }
}

function EntryRoute() {
  const { token, role } = readAuthState()

  if (!token || !role) {
    return <AuthPage />
  }

  return <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace />
}

function ProtectedRoleRoute({ role, element }: { role: UserRole; element: ReactElement }) {
  const { token, role: currentRole } = readAuthState()

  if (!token || !currentRole) {
    return <Navigate to="/" replace />
  }

  if (currentRole !== role) {
    return <Navigate to={currentRole === 'teacher' ? '/teacher' : '/student'} replace />
  }

  return element
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryRoute />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/teacher" element={<ProtectedRoleRoute role="teacher" element={<TeacherDashboard />} />} />
        <Route path="/student" element={<ProtectedRoleRoute role="student" element={<StudentPage />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
