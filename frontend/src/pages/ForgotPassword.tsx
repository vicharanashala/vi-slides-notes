import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);

        try {
            const res = await api.post('/auth/forgotpassword', { email });
            setStatus({ type: 'success', message: res.data.message || 'Email sent successfully!' });
            setEmail('');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
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
                        <h1 className="auth-title">Forgot Password</h1>
                        <p className="auth-subtitle">Enter your email to receive a password reset link.</p>
                    </div>

                    {status && (
                        <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'} slide-in`} style={status.type === 'success' ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' } : {}}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading || status?.type === 'success'}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span style={{ marginLeft: '0.5rem' }}>Sending...</span>
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer" style={{ marginTop: '2rem' }}>
                        <p>
                            Remember your password?{' '}
                            <Link to="/login" className="auth-link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
