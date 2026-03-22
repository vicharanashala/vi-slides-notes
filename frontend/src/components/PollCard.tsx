import React, { useState, useEffect } from 'react';
import { Poll, pollService } from '../services/pollService';

interface PollCardProps {
    poll: Poll;
    isTeacher: boolean;
    onClose?: (closedPoll: Poll) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, isTeacher, onClose }) => {
    const [voted, setVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [timerActive, setTimerActive] = useState(false);

    // Track if user has voted locally for this poll ID
    useEffect(() => {
        const hasVoted = localStorage.getItem(`voted_poll_${poll._id}`);
        if (hasVoted) setVoted(true);
    }, [poll._id]);

    // Initialize and manage timer
    useEffect(() => {
        if (!poll.timerEnabled || !poll.isActive || voted) {
            setTimeRemaining(null);
            setTimerActive(false);
            return;
        }

        if (!poll.timerStartedAt) return;

        const startTime = new Date(poll.timerStartedAt).getTime();
        const durationMs = (poll.timerDuration || 0) * 1000;
        
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
            setTimeRemaining(remaining);
            setTimerActive(remaining > 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [poll.timerEnabled, poll.timerDuration, poll.timerStartedAt, poll.isActive, voted]);

    const handleVote = async (index: number) => {
        if (voted || !poll.isActive) return;

        setLoading(true);
        try {
            const response = await pollService.votePoll(poll._id, index);
            if (response.success) {
                setVoted(true);
                localStorage.setItem(`voted_poll_${poll._id}`, 'true');
                setTimeRemaining(null);
                setTimerActive(false);
            }
        } catch (err) {
            console.error('Vote error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        if (!isTeacher) return;
        setLoading(true);
        try {
            const response = await pollService.closePoll(poll._id);
            if (response.success && onClose) {
                onClose(response.data);
            }
        } catch (err) {
            console.error('Close poll error:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    // Calculate timer percentage for visual indicator
    const timerPercentage = poll.timerDuration ? ((timeRemaining || 0) / poll.timerDuration) * 100 : 0;
    const timerColor = timeRemaining! <= 5 ? '#ef4444' : timerPercentage > 50 ? '#10b981' : '#f59e0b';

    return (
        <div className="glass-card anim-slide-up" style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            border: poll.isActive ? '1px solid var(--color-primary-light)' : '1px solid rgba(255,255,255,0.05)',
            background: poll.isActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--color-surface)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-primary-light)' }}>
                        {poll.isActive ? 'LIVE POLL' : 'POLL CLOSED'}
                    </span>
                    {!poll.isActive && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>• Final Results</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {poll.timerEnabled && poll.isActive && timeRemaining !== null && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            background: `rgba(255, 107, 107, 0.1)`,
                            border: `2px solid ${timerColor}`,
                            borderRadius: '8px',
                            animation: timeRemaining! <= 5 ? 'pulse 1s infinite' : 'none'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                            <span style={{ fontWeight: 'bold', color: timerColor, minWidth: '30px', textAlign: 'right' }}>
                                {timeRemaining}s
                            </span>
                        </div>
                    )}
                    {isTeacher && poll.isActive && (
                        <button
                            onClick={handleClose}
                            className="btn btn-secondary"
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: '#ef4444' }}
                            disabled={loading}
                        >
                            End Poll
                        </button>
                    )}
                </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>{poll.question}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {poll.options.map((option, index) => {
                    const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                    const showResults = !poll.isActive || voted || isTeacher;

                    return (
                        <div key={index} style={{ position: 'relative' }}>
                            {(!showResults) ? (
                                <button
                                    onClick={() => handleVote(index)}
                                    className="btn btn-secondary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                    disabled={loading || (poll.timerEnabled && !timerActive)}
                                >
                                    {option.text}
                                    {poll.timerEnabled && !timerActive && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#ef4444' }}>Time's up!</span>}
                                </button>
                            ) : (
                                <div style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.02)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {/* Animated Progress Bar */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: `${percentage}%`,
                                        background: 'var(--gradient-primary)',
                                        opacity: 0.15,
                                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                        zIndex: 0
                                    }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option.text}</span>
                                            {isTeacher && poll.isActive && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Direct service call to declare winner
                                                        import('../services/pollService').then(({ pollService }) => {
                                                            pollService.declareWinner(poll._id, index);
                                                        });
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', marginLeft: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                                                    title="Mark correct & award points"
                                                >
                                                    ✅ Award
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{option.votes} votes</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-primary-light)', minWidth: '40px', textAlign: 'right' }}>{percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                Total responses: {totalVotes}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default PollCard;
