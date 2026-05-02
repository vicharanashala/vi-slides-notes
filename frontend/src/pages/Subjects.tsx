import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subjectService, Subject } from '../services/subjectService';
import Toast from '../components/Toast';

const Subjects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isTeacher = user?.role === 'Teacher';

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await subjectService.getAllSubjects();
            if (res.success) setSubjects(res.data);
        } catch {
            setToast({ message: 'Failed to load subjects', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setSubmitting(true);
        try {
            const res = await subjectService.createSubject(formData);
            if (res.success) {
                setToast({ message: 'Subject created successfully!', type: 'success' });
                setShowCreateForm(false);
                setFormData({ name: '', description: '' });
                fetchSubjects();
            }
        } catch {
            setToast({ message: 'Failed to create subject', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this subject? This cannot be undone.')) return;
        try {
            const res = await subjectService.deleteSubject(id);
            if (res.success) {
                setToast({ message: 'Subject deleted', type: 'info' });
                fetchSubjects();
            }
        } catch {
            setToast({ message: 'Failed to delete subject', type: 'error' });
        }
    };

    const handleRequestJoin = async (id: string) => {
        setJoiningId(id);
        try {
            const res = await subjectService.requestToJoin(id);
            if (res.success) {
                setToast({ message: 'Join request sent! Waiting for teacher approval.', type: 'success' });
                fetchSubjects();
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || 'Failed to send request', type: 'error' });
        } finally {
            setJoiningId(null);
        }
    };

    const card: React.CSSProperties = {
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-surface)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
    };

    const badge = (color: string, bg: string): React.CSSProperties => ({
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color,
        background: bg,
    });

    const btn = (primary = true): React.CSSProperties => ({
        padding: '0.5rem 1.1rem',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem',
        background: primary ? 'var(--color-primary)' : 'var(--color-surface)',
        color: primary ? '#fff' : 'var(--color-text)',
        transition: 'opacity 0.15s',
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ ...btn(false), padding: '0.4rem 0.9rem' }}>← Back</button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                            {isTeacher ? 'My Subjects' : 'Browse Subjects'}
                        </h1>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            {isTeacher ? 'Manage your subjects and student enrollment' : 'Request to join subjects taught by teachers'}
                        </p>
                    </div>
                </div>
                {isTeacher && (
                    <button onClick={() => setShowCreateForm(true)} style={btn(true)}>
                        + Create Subject
                    </button>
                )}
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', margin: '1rem' }}>
                        <h2 style={{ margin: '0 0 1.5rem', color: 'var(--color-text)' }}>Create New Subject</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    Subject Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Mathematics, Physics..."
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '10px',
                                        border: '1px solid var(--color-surface)', background: 'var(--color-bg)',
                                        color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief description of this subject..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '10px',
                                        border: '1px solid var(--color-surface)', background: 'var(--color-bg)',
                                        color: 'var(--color-text)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreateForm(false)} style={btn(false)}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ ...btn(true), opacity: submitting ? 0.6 : 1 }}>
                                    {submitting ? 'Creating...' : 'Create Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                    <div className="spinner" style={{ width: '36px', height: '36px' }} />
                </div>
            ) : subjects.length === 0 ? (
                <div style={{
                    textAlign: 'center', paddingTop: '5rem',
                    color: 'var(--color-text-muted)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                    <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                        {isTeacher ? 'No subjects yet' : 'No subjects available'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {isTeacher ? 'Create your first subject to get started.' : 'Check back later for subjects to join.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {subjects.map(sub => (
                        <div key={sub._id} style={card}
                            onClick={() => navigate(`/subjects/${sub._id}`)}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = '';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                            }}
                        >
                            {/* Subject icon + name */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                    background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem'
                                }}>
                                    📖
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {sub.name}
                                    </h3>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        by {(sub.teacher as any)?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            {sub.description && (
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                                    {sub.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {isTeacher ? (
                                    <>
                                        <span style={badge('var(--color-primary)', 'rgba(99,102,241,0.15)')}>
                                            👥 {sub.enrolledStudents?.length ?? 0} enrolled
                                        </span>
                                        {(sub.pendingRequests?.length ?? 0) > 0 && (
                                            <span style={badge('#f59e0b', 'rgba(245,158,11,0.15)')}>
                                                ⏳ {sub.pendingRequests?.length} pending
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span style={badge('var(--color-text-muted)', 'var(--color-surface)')}>
                                            👥 {sub.enrolledCount ?? 0} students
                                        </span>
                                        {sub.status === 'enrolled' && (
                                            <span style={badge('#10b981', 'rgba(16,185,129,0.15)')}>✓ Enrolled</span>
                                        )}
                                        {sub.status === 'pending' && (
                                            <span style={badge('#f59e0b', 'rgba(245,158,11,0.15)')}>⏳ Pending</span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => navigate(`/subjects/${sub._id}`)}
                                    style={{ ...btn(true), flex: 1 }}
                                >
                                    {isTeacher ? 'Manage →' : 'View →'}
                                </button>
                                {!isTeacher && sub.status === 'not_joined' && (
                                    <button
                                        onClick={() => handleRequestJoin(sub._id)}
                                        disabled={joiningId === sub._id}
                                        style={{ ...btn(false), flex: 1, opacity: joiningId === sub._id ? 0.6 : 1 }}
                                    >
                                        {joiningId === sub._id ? 'Sending...' : 'Request Join'}
                                    </button>
                                )}
                                {isTeacher && (
                                    <button
                                        onClick={() => handleDelete(sub._id)}
                                        style={{ ...btn(false), color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subjects;
