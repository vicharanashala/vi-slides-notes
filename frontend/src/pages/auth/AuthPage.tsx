import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../../config/api'

type UserRole = 'teacher' | 'student'

interface AuthResponse {
  success: boolean
  token: string
  email: string
  role: UserRole | null
  rolePending?: boolean
  message?: string
}

const clearAuthKeys = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  localStorage.removeItem('role')
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')      // 'login' | 'register'
  const [role, setRole] = useState<UserRole>('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'login' ? API_ENDPOINTS.authLogin : API_ENDPOINTS.authRegister

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { email, password, role } : { email, password }),
      })

      const data = await res.json() as AuthResponse

      if (!res.ok || !data.success) {
        setError(data.message || 'Something went wrong')
        setLoading(false)
        return
      }

      // Save token + backend-trusted role
      localStorage.setItem('token', data.token)
      localStorage.setItem('email', data.email)

      if (data.rolePending) {
        localStorage.removeItem('role')
        navigate('/auth/callback?rolePending=true')
        return
      }

      if (!data.role) {
        setError('Role setup is incomplete. Please try login again.')
        clearAuthKeys()
        return
      }

      localStorage.setItem('role', data.role)

      // Redirect based on role
      navigate(data.role === 'teacher' ? '/teacher' : '/student')
    } catch {
      setError('Cannot reach server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const startGoogleSignIn = async () => {
    setError('')

    try {
      const statusRes = await fetch(API_ENDPOINTS.authGoogleStatus)
      const statusData = await statusRes.json() as { success?: boolean; googleAuthEnabled?: boolean }

      if (!statusRes.ok || !statusData.success || !statusData.googleAuthEnabled) {
        setError('Google authentication is not configured on backend yet. Please set Google OAuth env keys.')
        return
      }

      window.location.assign(API_ENDPOINTS.authGoogleStart)
    } catch {
      setError('Cannot reach server. Is the backend running?')
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1 className="logo">Vi-SlideS</h1>
        <p className="subtitle">AI-Powered Adaptive Classroom</p>

        {/* Mode toggle */}
        <div className="toggle-row">
          <button
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => { setMode('login'); setError('') }}
          >Login</button>
          <button
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => { setMode('register'); setError('') }}
          >Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {mode === 'register' && (
            <>
              <label>I am a</label>
              <div className="toggle-row">
                <button
                  type="button"
                  className={role === 'teacher' ? 'tab active' : 'tab'}
                  onClick={() => setRole('teacher')}
                >Teacher</button>
                <button
                  type="button"
                  className={role === 'student' ? 'tab active' : 'tab'}
                  onClick={() => setRole('student')}
                >Student</button>
              </div>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <button id="auth-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>

          <button
            type="button"
            className="btn-outline"
            style={{ width: '100%', marginTop: 10 }}
            onClick={startGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  )
}
