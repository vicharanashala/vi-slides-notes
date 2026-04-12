import React, { useState } from 'react';
import { socketService } from '../services/socketService';

interface EngagementControlsProps {
    sessionCode: string;
    user: any;
}

const EngagementControls: React.FC<EngagementControlsProps> = ({ sessionCode, user }) => {
    const [understanding, setUnderstanding] = useState('understanding');
    const [isHandRaised, setIsHandRaised] = useState(false);

    const handleUnderstandingChange = (level: string) => {
        setUnderstanding(level);
        socketService.emitUnderstandingUpdate(sessionCode, level, user);
    };

    const toggleHandRaise = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        socketService.emitHandRaise(sessionCode, newState, user);
    };
    return (
        <div
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                How are you feeling?
            </span>

            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.25rem', borderRadius: '12px' }}>
                <button
                    onClick={() => handleUnderstandingChange('understanding')}
                    title="Got It"
                    style={{
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: understanding === 'understanding' ? '#10b981' : 'transparent',
                        color: understanding === 'understanding' ? '#fff' : 'var(--color-text-muted)',
                        transition: 'all 0.2s ease',
                        boxShadow: understanding === 'understanding' ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                >
                    🙂 Got it
                </button>
                <button
                    onClick={() => handleUnderstandingChange('neutral')}
                    title="Ok"
                    style={{
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: understanding === 'neutral' ? '#f59e0b' : 'transparent',
                        color: understanding === 'neutral' ? '#fff' : 'var(--color-text-muted)',
                        transition: 'all 0.2s ease',
                        boxShadow: understanding === 'neutral' ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                >
                    😐 Ok
                </button>
                <button
                    onClick={() => handleUnderstandingChange('confused')}
                    title="Lost"
                    style={{
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: understanding === 'confused' ? '#ef4444' : 'transparent',
                        color: understanding === 'confused' ? '#fff' : 'var(--color-text-muted)',
                        transition: 'all 0.2s ease',
                        boxShadow: understanding === 'confused' ? '0 2px 10px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                >
                    😕 Lost
                </button>
            </div>
        </div>

        <button
            onClick={toggleHandRaise}
            style={{
                border: '1px solid',
                borderColor: isHandRaised ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isHandRaised ? 'var(--color-warning)' : 'rgba(255, 255, 255, 0.05)',
                color: isHandRaised ? '#fff' : 'var(--color-text-primary)',
                transition: 'all 0.2s ease',
                boxShadow: isHandRaised ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
            }}
        >
            {isHandRaised ? '✋ Lower Hand' : '✋ Raise Hand'}
        </button>
    </div>
    );
};

export default EngagementControls;
