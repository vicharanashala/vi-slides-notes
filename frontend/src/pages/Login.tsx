import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Login: React.FC = () => {
    const { googleLogin } = useAuth();

    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse?.credential) {
                setError('Google credential was not received');
                return;
            }

            await googleLogin({
                token: credentialResponse.credential,
                intent: 'student_login'
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google Login failed');
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
                        <h1 className="auth-title">Google Sign In</h1>
                        <p className="auth-subtitle">Students can continue instantly with Google</p>
                    </div>

                    {error && (
                        <div className="alert alert-error slide-in">
                            {error}
                        </div>
                    )}

                    <div className="auth-form" style={{ textAlign: 'center' }}>
                        <p className="text-muted" style={{ marginBottom: '1rem' }}>
                            Secure sign-in powered by Google OAuth and backend JWT verification.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="250"
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Teacher and need access?{' '}
                            <Link to="/register" className="auth-link">
                                Verify Teacher Signup
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
