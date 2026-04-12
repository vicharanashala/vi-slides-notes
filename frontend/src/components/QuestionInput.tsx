import React, { useState } from 'react';
import { questionService } from '../services/questionService';

interface QuestionInputProps {
    sessionId: string;
    sessionStatus?: string;
    onQuestionSubmitted?: (question: any) => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ sessionId, sessionStatus, onQuestionSubmitted }) => {
    const isPaused = sessionStatus === 'paused';
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Voice recognition is not supported in your browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setContent(prev => {
                const newContent = prev.trim() ? `${prev} ${transcript}` : transcript;
                return newContent;
            });
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
            } else {
                setError('Speech recognition failed. Try again.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check: Don't submit if already loading or no content
        if (loading || !content.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await questionService.createQuestion({
                content: content.trim(),
                sessionId,
                isDirectToTeacher: true // Always send to teacher first
            });

            if (response.success) {
                setContent(''); // Clear UI immediately
                if (onQuestionSubmitted) {
                    onQuestionSubmitted(response.data);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                    className="form-input"
                    placeholder={isPaused ? "Session is paused by teacher" : "Type your question..."}
                    rows={2}
                    style={{
                        resize: 'none',
                        background: isPaused ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: isPaused ? 'not-allowed' : 'text',
                        width: '100%',
                        padding: '1rem',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                        color: 'var(--color-text-primary)'
                    }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isPaused) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    disabled={loading || isPaused}
                />

                {error && <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, paddingLeft: '0.5rem' }}>{error}</span>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ opacity: isPaused ? 0.5 : 1 }}>
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            style={{
                                background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                border: isListening ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                padding: '0.5rem 0.8rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: isListening ? '#ef4444' : 'var(--color-text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
                            }}
                            title="Voice Input"
                            disabled={loading || isPaused}
                        >
                            {isListening ? '🛑 Stop Recording...' : '🎤 Voice Type'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.3px',
                            boxShadow: content.trim() ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
                            opacity: (!content.trim() || isPaused || loading) ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        disabled={loading || !content.trim() || isPaused}
                    >
                        {loading ? 'Sending...' : (isPaused ? 'Paused' : 'Submit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionInput;
