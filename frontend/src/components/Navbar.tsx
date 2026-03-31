import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './Navbar.css'

interface NavbarProps {
  variant?: 'teacher' | 'student'
}

function Navbar({ variant = 'teacher' }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardLink = variant === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  return (
    <nav className="vi-navbar">
      <Link to={dashboardLink} className="vi-navbar-brand">
        <img src={logo} alt="Vi-Slides" className="vi-navbar-logo" />
        <span className="vi-navbar-title">Vi-SlideS</span>
      </Link>

      <div className="vi-navbar-user-wrapper">
        <div 
          className="vi-navbar-user" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="vi-navbar-name">{user?.name || (variant === 'teacher' ? 'Teacher' : 'Student')}</span>
          <div className="vi-navbar-avatar">
            {user?.name?.charAt(0).toUpperCase() || (variant === 'teacher' ? 'T' : 'S')}
          </div>
        </div>

        {dropdownOpen && (
          <div className="vi-navbar-dropdown">
            <p className="vi-navbar-dropdown-label">Signed in as</p>
            <p className="vi-navbar-dropdown-email">{user?.email || 'user@example.com'}</p>
            <hr className="vi-navbar-dropdown-divider" />
            <button className="vi-navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
