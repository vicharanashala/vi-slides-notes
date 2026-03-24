import React, { useState } from 'react';
import { questionService } from '../services/questionService';

interface StudentQuestionInputProps {
    sessionId: string;
    sessionStatus?: string;
    onQuestionSubmitted?: (question: any) => void;
}

const StudentQuestionInput: React.FC<StudentQuestionInputProps> = ({ sessionId, sessionStatus, onQuestionSubmitted }) => {
    const isPaused = sessionStatus === 'paused';
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await questionService.createQuestion({
                content: content.trim(),
                sessionId,
                isDirectToTeacher: false
            });

            if (response.success) {
                setContent('');
                onQuestionSubmitted?.(response.data);
            } else {
                setError('Failed to submit question');
            }
        } catch (err) {
            console.error('Submit question error:', err);
            setError('Failed to submit question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem'
        }}>
            <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1rem',
                color: 'var(--color-text)'
            }}>
                Ask a Question
            </h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your question here..."
                    disabled={isPaused || loading}
                    style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.5rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text)',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        marginBottom: '0.5rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isPaused || loading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: (!content.trim() || isPaused || loading) ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        opacity: (!content.trim() || isPaused || loading) ? 0.5 : 1
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Question'}
                </button>
            </form>
            {error && (
                <p style={{
                    color: 'var(--color-error)',
                    fontSize: '0.8rem',
                    margin: '0.5rem 0 0 0'
                }}>
                    {error}
                </p>
            )}
            {isPaused && (
                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8rem',
                    margin: '0.5rem 0 0 0'
                }}>
                    Question submission is paused.
                </p>
            )}
        </div>
    );
};

export default StudentQuestionInput;