import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';

interface SpotlightModalProps {
    socketService: any;
    onClose: () => void;
}

const SpotlightModal: React.FC<SpotlightModalProps> = ({ socketService, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [winner, setWinner] = useState<{ id: string, name: string } | null>(null);
    const [isSpinning, setIsSpinning] = useState(true);
    const [currentName, setCurrentName] = useState('Picking...');

    useEffect(() => {
        socketService.onSpotlightResult((data: any) => {
            setWinner(data.winner);
            setIsSpinning(true);
            setIsVisible(true);

            // Animation logic
            const names = ['Analyzing focus...', 'Checking participation...', 'Identifying engagement...', 'Almost there...'];
            let nameIdx = 0;
            const interval = setInterval(() => {
                setCurrentName(names[nameIdx % names.length]);
                nameIdx++;
            }, 500);

            setTimeout(() => {
                clearInterval(interval);
                setIsSpinning(false);
            }, data.spinDuration || 3000);
        });

        return () => socketService.offSpotlightEvents();
    }, [socketService]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            color: 'white'
        }}>
            <div className="glass-card" style={{
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%',
                border: '2px solid var(--color-primary)',
                animation: 'pulse 2s infinite'
            }}>
                {isSpinning ? (
                    <div>
                        <div className="spinner" style={{ width: '80px', height: '80px', margin: '0 auto 2rem auto', borderTopColor: 'var(--color-primary)' }}></div>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-light)' }}>MYSTERY SPOTLIGHT</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{currentName}</p>
                    </div>
                ) : (
                    <div style={{ animation: 'bounceIn 0.8s cubic-bezier(0.36, 0, 0.66, -0.56) forwards' }}>
                        <Confetti active={true} duration={5000} />
                        <h1 style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Student Spotlight!</h1>
                        <div style={{ fontSize: '4rem', margin: '1.5rem 0', fontWeight: '900', color: 'white', textShadow: '0 0 20px var(--color-primary)' }}>
                            {winner?.name}
                        </div>
                        <p style={{ color: 'var(--color-primary-light)', fontSize: '1.1rem', marginBottom: '2rem' }}>You have been chosen by the wheel!</p>
                        <button onClick={() => {
                            setIsVisible(false);
                            onClose();
                        }} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Fantastic!</button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default SpotlightModal;
