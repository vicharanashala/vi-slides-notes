import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { googleLogin } = useAuth();

    const [teacherId, setTeacherId] = useState('');
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse?.credential) {
                setError('Google credential was not received');
                return;
            }

            if (!teacherId.trim()) {
                setError('Teacher ID is required for teacher signup');
                return;
            }

            await googleLogin({
                token: credentialResponse.credential,
                intent: 'teacher_signup',
                teacherId: teacherId.trim().toUpperCase()
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Teacher signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-content fade-in">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Teacher Sign Up</h1>
                        <p className="auth-subtitle">Verify your Teacher ID and continue with Google</p>
                    </div>

                    {error && (
                        <div className="alert alert-error slide-in">
                            {error}
                        </div>
                    )}

                    <div className="auth-form">
                        <div className="form-group">
                            <label htmlFor="teacherId" className="form-label">Teacher ID</label>
                            <input
                                type="text"
                                id="teacherId"
                                name="teacherId"
                                className="form-input"
                                placeholder="Enter your teacher verification ID"
                                value={teacherId}
                                onChange={(e) => {
                                    setTeacherId(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                            <small style={{ color: 'var(--color-text-muted)' }}>
                                This ID is verified by the server before a teacher account is created.
                            </small>
                        </div>
                    </div>

                    <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0 10px', color: '#ccc', position: 'relative', zIndex: 1, borderRadius: '4px' }}>CONTINUE</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 0 }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Signup Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="250"
                            text="signup_with"
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Student or existing user?{' '}
                            <Link to="/login" className="auth-link">
                                Go to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
