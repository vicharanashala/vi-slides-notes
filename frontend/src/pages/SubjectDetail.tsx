import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { subjectService, Subject } from '../services/subjectService';
import { sessionService } from '../services/sessionService';
import { assignmentService } from '../services/assignmentService';
import { submissionService } from '../services/submissionService';
import Toast from '../components/Toast';

type Tab = 'sessions' | 'assignments' | 'students';

const SubjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isTeacher = user?.role === 'Teacher';

    const [subject, setSubject] = useState<Subject | null>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('sessions');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Session creation form
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionDesc, setSessionDesc] = useState('');
    const [creatingSession, setCreatingSession] = useState(false);

    // Assignment creation form
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [assignForm, setAssignForm] = useState({ title: '', description: '', maxMarks: 100, deadline: '' });
    const [creatingAssignment, setCreatingAssignment] = useState(false);

    const fetchAll = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [subRes, sessRes, assignRes] = await Promise.all([
                subjectService.getSubjectById(id),
                subjectService.getSubjectSessions(id),
                subjectService.getSubjectAssignments(id),
            ]);
            if (subRes.success) setSubject(subRes.data);
            if (sessRes.success) setSessions(sessRes.data);
            if (assignRes.success) setAssignments(assignRes.data);

            if (!isTeacher) {
                try {
                    const subRes2 = await submissionService.getMySubmissions();
                    if (subRes2.success) setSubmissions(subRes2.data);
                } catch { /* ignore */ }
            }
        } catch {
            setToast({ message: 'Failed to load subject details', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, isTeacher]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionTitle.trim()) return;
        setCreatingSession(true);
        try {
            const res = await sessionService.createSession({ title: sessionTitle, description: sessionDesc, subjectId: id } as any);
            if (res.success) {
                setToast({ message: 'Session created!', type: 'success' });
                setShowSessionForm(false);
                setSessionTitle('');
                setSessionDesc('');
                navigate(`/session/${res.data.code}`);
            }
        } catch {
            setToast({ message: 'Failed to create session', type: 'error' });
        } finally {
            setCreatingSession(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingAssignment(true);
        try {
            const res = await assignmentService.createAssignment({ ...assignForm, subjectId: id } as any);
            if (res.success) {
                setToast({ message: 'Assignment created!', type: 'success' });
                setShowAssignmentForm(false);
                setAssignForm({ title: '', description: '', maxMarks: 100, deadline: '' });
                fetchAll();
            }
        } catch {
            setToast({ message: 'Failed to create assignment', type: 'error' });
        } finally {
            setCreatingAssignment(false);
        }
    };

    const handleApprove = async (studentId: string) => {
        if (!id) return;
        try {
            await subjectService.approveStudent(id, studentId);
            setToast({ message: 'Student approved!', type: 'success' });
            fetchAll();
        } catch {
            setToast({ message: 'Failed to approve student', type: 'error' });
        }
    };

    const handleReject = async (studentId: string) => {
        if (!id) return;
        try {
            await subjectService.rejectStudent(id, studentId);
            setToast({ message: 'Request rejected', type: 'info' });
            fetchAll();
        } catch {
            setToast({ message: 'Failed to reject request', type: 'error' });
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!id || !window.confirm('Remove this student from the subject?')) return;
        try {
            await subjectService.removeStudent(id, studentId);
            setToast({ message: 'Student removed', type: 'info' });
            fetchAll();
        } catch {
            setToast({ message: 'Failed to remove student', type: 'error' });
        }
    };

    const handleJoinSession = async (code: string) => {
        try {
            const res = await sessionService.joinSession(code);
            if (res.success) navigate(`/session/${res.data.code}`);
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || 'Failed to join session', type: 'error' });
        }
    };

    const s = (primary = true): React.CSSProperties => ({
        padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
        background: primary ? 'var(--color-primary)' : 'var(--color-surface)',
        color: primary ? '#fff' : 'var(--color-text)', transition: 'opacity 0.15s'
    });

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem', borderRadius: '10px',
        border: '1px solid var(--color-surface)', background: 'var(--color-bg)',
        color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box'
    };

    const modalBg: React.CSSProperties = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    };

    const modalBox: React.CSSProperties = {
        background: 'var(--color-bg-secondary)', borderRadius: '20px', padding: '2rem',
        width: '100%', maxWidth: '500px', margin: '1rem'
    };

    const statusBadge = (status: string): React.CSSProperties => {
        const map: Record<string, [string, string]> = {
            active: ['#10b981', 'rgba(16,185,129,0.15)'],
            ended: ['#6b7280', 'var(--color-surface)'],
            paused: ['#f59e0b', 'rgba(245,158,11,0.15)'],
            inactive: ['#6b7280', 'var(--color-surface)'],
        };
        const [color, bg] = map[status] ?? ['#6b7280', 'var(--color-surface)'];
        return { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color, background: bg };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
        );
    }

    if (!subject) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-bg)', minHeight: '100vh' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Subject not found.</p>
                <button onClick={() => navigate('/subjects')} style={s(false)}>← Back to Subjects</button>
            </div>
        );
    }

    const pendingRequests = (subject.pendingRequests ?? []) as any[];
    const enrolledStudents = (subject.enrolledStudents ?? []) as any[];
    const activeSession = sessions.find(s => s.status === 'active');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
                padding: '2rem 2rem 3rem',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/subjects')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}
                >
                    ← Subjects
                </button>
                <h1 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '2rem', fontWeight: 800 }}>{subject.name}</h1>
                {subject.description && <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{subject.description}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                        👤 {(subject.teacher as any)?.name}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                        👥 {enrolledStudents.length} enrolled
                    </span>
                    {activeSession && (
                        <span style={{ background: 'rgba(16,185,129,0.3)', color: '#a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                            🟢 Session Live
                        </span>
                    )}
                </div>

                {/* Active session banner for students */}
                {!isTeacher && activeSession && (
                    <div style={{
                        marginTop: '1.25rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '14px', padding: '1rem 1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
                    }}>
                        <div>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 700 }}>🟢 Ongoing Session: {activeSession.title}</p>
                            <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>Your teacher has started a live session</p>
                        </div>
                        <button
                            onClick={() => handleJoinSession(activeSession.code)}
                            style={{ background: '#fff', color: 'var(--color-primary)', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            Join Now →
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-surface)', padding: '0 2rem', display: 'flex', gap: '0', overflowX: 'auto' }}>
                {(['sessions', 'assignments', ...(isTeacher ? ['students'] : [])] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '1rem 1.25rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.9rem', background: 'transparent', whiteSpace: 'nowrap',
                        color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'color 0.15s'
                    }}>
                        {t === 'sessions' && '🎓 Sessions'}
                        {t === 'assignments' && '📝 Assignments'}
                        {t === 'students' && `👥 Students${pendingRequests.length ? ` (${pendingRequests.length} pending)` : ''}`}
                    </button>
                ))}
            </div>

            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* ── SESSIONS TAB ── */}
                {tab === 'sessions' && (
                    <div>
                        {isTeacher && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button onClick={() => setShowSessionForm(true)} style={s(true)}>+ Start Session</button>
                            </div>
                        )}
                        {sessions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                                <p>No sessions yet for this subject.</p>
                                {isTeacher && <p style={{ fontSize: '0.875rem' }}>Start a session to begin teaching.</p>}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {sessions.map(sess => (
                                    <div key={sess._id} style={{
                                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-surface)',
                                        borderRadius: '14px', padding: '1.25rem', display: 'flex',
                                        alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{sess.title}</h3>
                                                <span style={statusBadge(sess.status)}>{sess.status}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                Code: <strong>{sess.code}</strong> · {new Date(sess.createdAt).toLocaleDateString()}
                                                · {sess.students?.length ?? 0} students
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {sess.status === 'active' ? (
                                                <button
                                                    onClick={() => isTeacher ? navigate(`/session/${sess.code}`) : handleJoinSession(sess.code)}
                                                    style={s(true)}
                                                >
                                                    {isTeacher ? 'Manage →' : 'Join →'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/session/${sess.code}`)}
                                                    style={s(false)}
                                                >
                                                    View Summary
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ASSIGNMENTS TAB ── */}
                {tab === 'assignments' && (
                    <div>
                        {isTeacher && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button onClick={() => setShowAssignmentForm(true)} style={s(true)}>+ Create Assignment</button>
                            </div>
                        )}
                        {assignments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                                <p>No assignments for this subject yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {assignments.map(assign => {
                                    const mySubmission = submissions.find(sub => sub.assignment === assign._id || sub.assignment?._id === assign._id);
                                    const isPast = new Date(assign.deadline) < new Date();
                                    return (
                                        <div key={assign._id} style={{
                                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-surface)',
                                            borderRadius: '14px', padding: '1.25rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{assign.title}</h3>
                                                        {isPast
                                                            ? <span style={statusBadge('ended')}>Closed</span>
                                                            : <span style={statusBadge('active')}>Active</span>}
                                                    </div>
                                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{assign.description}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        Max Marks: <strong>{assign.maxMarks}</strong> ·
                                                        Due: <strong>{new Date(assign.deadline).toLocaleDateString()}</strong>
                                                    </p>
                                                </div>
                                                {!isTeacher && (
                                                    <div>
                                                        {mySubmission ? (
                                                            <span style={{ ...statusBadge('active'), fontSize: '0.8rem' }}>✓ Submitted</span>
                                                        ) : !isPast ? (
                                                            <button onClick={() => navigate(`/assignments/${assign._id}`)} style={s(true)}>
                                                                Submit →
                                                            </button>
                                                        ) : (
                                                            <span style={{ ...statusBadge('ended'), fontSize: '0.8rem' }}>Missed</span>
                                                        )}
                                                    </div>
                                                )}
                                                {isTeacher && (
                                                    <button onClick={() => navigate(`/assignments/${assign._id}`)} style={s(false)}>
                                                        View Submissions
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── STUDENTS TAB (Teacher only) ── */}
                {tab === 'students' && isTeacher && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Pending Requests */}
                        {pendingRequests.length > 0 && (
                            <div>
                                <h3 style={{ margin: '0 0 1rem', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700 }}>
                                    ⏳ Pending Requests ({pendingRequests.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    {pendingRequests.map((student: any) => (
                                        <div key={student._id} style={{
                                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                                            borderRadius: '12px', padding: '1rem 1.25rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{student.name}</p>
                                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{student.email}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleApprove(student._id)} style={{ ...s(true), background: '#10b981' }}>
                                                    ✓ Approve
                                                </button>
                                                <button onClick={() => handleReject(student._id)} style={{ ...s(false), color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Enrolled Students */}
                        <div>
                            <h3 style={{ margin: '0 0 1rem', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700 }}>
                                ✅ Enrolled Students ({enrolledStudents.length})
                            </h3>
                            {enrolledStudents.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No students enrolled yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    {enrolledStudents.map((student: any) => (
                                        <div key={student._id} style={{
                                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-surface)',
                                            borderRadius: '12px', padding: '1rem 1.25rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                                                }}>
                                                    {student.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{student.name}</p>
                                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{student.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveStudent(student._id)} style={{ ...s(false), color: '#ef4444', background: 'rgba(239,68,68,0.08)', fontSize: '0.8rem' }}>
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {pendingRequests.length === 0 && enrolledStudents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                                <p>No students yet. Share your subject so students can request to join.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Session Modal */}
            {showSessionForm && (
                <div style={modalBg}>
                    <div style={modalBox}>
                        <h2 style={{ margin: '0 0 1.5rem', color: 'var(--color-text)' }}>Start New Session</h2>
                        <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Session Title *</label>
                                <input type="text" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} placeholder="e.g. Chapter 3 - Derivatives" required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Description (optional)</label>
                                <textarea value={sessionDesc} onChange={e => setSessionDesc(e.target.value)} placeholder="What will you cover today?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowSessionForm(false)} style={s(false)}>Cancel</button>
                                <button type="submit" disabled={creatingSession} style={{ ...s(true), opacity: creatingSession ? 0.6 : 1 }}>
                                    {creatingSession ? 'Starting...' : '🎓 Start Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {showAssignmentForm && (
                <div style={modalBg}>
                    <div style={modalBox}>
                        <h2 style={{ margin: '0 0 1.5rem', color: 'var(--color-text)' }}>Create Assignment</h2>
                        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Title *</label>
                                <input type="text" value={assignForm.title} onChange={e => setAssignForm(p => ({ ...p, title: e.target.value }))} placeholder="Assignment title" required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Description *</label>
                                <textarea value={assignForm.description} onChange={e => setAssignForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the assignment..." rows={3} required style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Max Marks</label>
                                    <input type="number" value={assignForm.maxMarks} onChange={e => setAssignForm(p => ({ ...p, maxMarks: Number(e.target.value) }))} min={1} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Deadline *</label>
                                    <input type="datetime-local" value={assignForm.deadline} onChange={e => setAssignForm(p => ({ ...p, deadline: e.target.value }))} required style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAssignmentForm(false)} style={s(false)}>Cancel</button>
                                <button type="submit" disabled={creatingAssignment} style={{ ...s(true), opacity: creatingAssignment ? 0.6 : 1 }}>
                                    {creatingAssignment ? 'Creating...' : '📝 Create Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectDetail;
