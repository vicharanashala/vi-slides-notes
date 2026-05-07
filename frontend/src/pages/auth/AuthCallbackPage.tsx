import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../../config/api'

type UserRole = 'teacher' | 'student'

const isUserRole = (value: string | null): value is UserRole => {
  return value === 'teacher' || value === 'student'
}

const clearAuthKeys = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  localStorage.removeItem('role')
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [rolePending, setRolePending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('error')
    const token = params.get('token') || localStorage.getItem('token') || ''
    const email = params.get('email') || localStorage.getItem('email') || ''
    const roleParam = params.get('role') || localStorage.getItem('role')
    const roleStillPending = params.get('rolePending') === 'true' || !isUserRole(roleParam)

    if (callbackError) {
      clearAuthKeys()
      setError('Google sign-in failed. Please try again.')
      setLoading(false)
      return
    }

    if (!token) {
      clearAuthKeys()
      setError('Missing auth token from Google callback.')
      setLoading(false)
      return
    }

    localStorage.setItem('token', token)

    if (email) {
      localStorage.setItem('email', email)
    }

    if (isUserRole(roleParam)) {
      localStorage.setItem('role', roleParam)
    } else {
      localStorage.removeItem('role')
    }

    if (roleStillPending || !isUserRole(roleParam)) {
      setRolePending(true)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate(roleParam === 'teacher' ? '/teacher' : '/student', { replace: true })
  }, [navigate])

  const finalizeRole = async (role: UserRole) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token') || ''

      if (!token) {
        throw new Error('Missing token for role setup')
      }

      const res = await fetch(API_ENDPOINTS.authRole, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to complete role setup')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('email', data.email)
      localStorage.setItem('role', data.role)

      setRolePending(false)
      navigate(data.role === 'teacher' ? '/teacher' : '/student', { replace: true })
    } catch {
      setError('Cannot reach server. Is backend running?')
      setLoading(false)
    }
  }

  if (loading && !rolePending) {
    return (
      <div className="page-center">
        <div className="card">
          <h1 className="logo">Vi-SlideS</h1>
          <p className="subtitle">Signing you in with Google...</p>
        </div>
      </div>
    )
  }

  if (!rolePending) {
    return (
      <div className="page-center">
        <div className="card">
          <h1 className="logo">Vi-SlideS</h1>
          <p className="subtitle">Authentication Issue</p>
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" onClick={() => navigate('/', { replace: true })}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1 className="logo">Vi-SlideS</h1>
        <p className="subtitle">Choose your role (one-time setup)</p>

        <div className="toggle-row">
          <button
            type="button"
            className="tab"
            disabled={loading}
            onClick={() => finalizeRole('teacher')}
          >
            Teacher
          </button>
          <button
            type="button"
            className="tab"
            disabled={loading}
            onClick={() => finalizeRole('student')}
          >
            Student
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
