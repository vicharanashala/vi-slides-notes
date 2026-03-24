import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { guestService } from '../services/guestService';

const QueryAsk: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<{ _id: string; title: string } | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        question: ''
    });

    const fetchQuestions = useCallback(async (sessionId: string, silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const response = await guestService.getGuestQuestions(sessionId);
            if (response.success) {
                setQuestions(response.data);
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
        } finally {
            if (!silent) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!code) return;
            try {
                const response = await guestService.getPublicSessionInfo(code);
                if (response.success) {
                    setSessionInfo(response.data);
                    await fetchQuestions(response.data._id);
                }
            } catch (err: any) {
                console.error('Session info fetch error:', err);
                setError('Session not found or inactive.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [code, fetchQuestions]);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!sessionInfo?._id) return;

        const interval = setInterval(() => {
            fetchQuestions(sessionInfo._id, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionInfo?._id, fetchQuestions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionInfo?._id || !formData.name.trim() || !formData.email.trim() || !formData.question.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await guestService.submitGuestQuestion({
                sessionId: sessionInfo._id,
                name: formData.name,
                email: formData.email,
                content: formData.question
            });

            if (response.success) {
                setSuccess(true);
                setFormData({ ...formData, question: '' }); // Clear only question
                await fetchQuestions(sessionInfo._id, true);
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to send question.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner" style={{ border: '4px solid rgba(99, 102, 241, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #1e1e2d, #0a0a0c)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '40px 20px',
            color: 'white'
        }}>
            <style>
                {`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.6s ease-out;
                    margin-bottom: 30px;
                }
                .input-field {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    padding: 16px;
                    width: 100%;
                    margin-bottom: 24px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .submit-btn {
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    padding: 16px;
                    width: 100%;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .question-item {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 16px;
                    animation: fadeIn 0.4s ease-out;
                    transition: all 0.3s ease;
                }
                .question-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(99, 102, 241, 0.3);
                }
                .refresh-icon {
                    display: inline-block;
                    animation: ${refreshing ? 'spin 1s linear infinite' : 'none'};
                }
                `}
            </style>

            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px'
                    }}>
                        ❓
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Ask a Question</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
                        {sessionInfo?.title || 'Join the conversation'}
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%', color: '#10b981', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                            fontSize: '24px'
                        }}>✓</div>
                        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Sent Successfully!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Your question will appear below shortly.</p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="submit-btn"
                            style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}
                        >
                            Ask Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                                padding: '12px', borderRadius: '8px', marginBottom: '20px',
                                fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ marginBottom: '16px', padding: '12px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ marginBottom: '16px', padding: '12px' }}
                                />
                            </div>
                        </div>

                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Your Question</label>
                        <textarea
                            className="input-field"
                            placeholder="What would you like to ask?"
                            rows={3}
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                            style={{ resize: 'none', padding: '12px' }}
                        />

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Sending...' : 'Post Question'}
                        </button>
                    </form>
                )}
            </div>

            <div style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Questions</h3>
                    <button
                        onClick={() => sessionInfo && fetchQuestions(sessionInfo._id)}
                        disabled={refreshing || !sessionInfo}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            color: 'white',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span className="refresh-icon">🔄</span>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>No questions yet. Be the first to ask!</p>
                    </div>
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="question-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#818cf8', fontWeight: '600', fontSize: '14px' }}>
                                    {q.guestName || (q.user && q.user.name) || 'Anonymous'}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                                    {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', margin: 0 }}>
                                {q.content}
                            </p>
                        </div>
                    ))
                )}

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '20px' }}>
                    Auto-updates every 5 seconds
                </p>
            </div>
        </div>
    );
};

export default QueryAsk;
