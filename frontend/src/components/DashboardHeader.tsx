import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardHeaderProps {
    showUserMenu?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ showUserMenu: initialShowUserMenu = false }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(initialShowUserMenu);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'var(--color-bg-secondary)',
            opacity: 0.95,
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--color-surface)',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1000
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                Vi-SlideS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                {/* Premium Avatar Trigger */}
                <div
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0.5rem 1.2rem',
                        borderRadius: 'var(--radius-full)',
                        transition: 'all 0.2s ease',
                        border: showUserMenu ? '1px solid var(--color-primary)' : '1px solid transparent',
                        background: showUserMenu ? 'rgba(255,255,255,0.05)' : 'transparent'
                    }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{user?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
                    </div>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user?.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                {/* Premium Dropdown Menu */}
                {showUserMenu && (
                    <div className="glass-card slide-in" style={{
                        position: 'absolute',
                        top: '125%',
                        right: 0,
                        width: '300px',
                        padding: '1rem',
                        zIndex: 1000,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-surface)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.3)'
                    }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-surface)', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Signed in as</p>
                            <p style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                        </div>

                        <button
                            onClick={() => {
                                navigate('/profile');
                                setShowUserMenu(false);
                            }}
                            className="btn"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                background: 'transparent',
                                color: 'var(--color-text)',
                                marginBottom: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem 1rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>👤</span>
                            <span style={{ fontSize: '1rem' }}>Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                toggleTheme();
                            }}
                            className="btn"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                background: 'transparent',
                                color: 'var(--color-text)',
                                marginBottom: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem 1rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                            <span style={{ fontSize: '1rem' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                background: 'transparent',
                                color: '#ef4444',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem 1rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>🚪</span>
                            <span style={{ fontSize: '1rem' }}>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default DashboardHeader;
