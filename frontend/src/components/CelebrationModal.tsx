import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';

interface CelebrationModalProps {
    isOpen: boolean;
    duration?: number;
    onClose: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, duration = 10000, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay fade-in"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                zIndex: 2000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            {/* Confetti Background */}
            {showConfetti && (
                <Confetti
                    duration={duration}
                    onComplete={() => setShowConfetti(false)}
                />
            )}

            {/* Celebration Card */}
            <div
                className="glass-card slide-in"
                style={{
                    position: 'relative',
                    zIndex: 2001,
                    padding: '3rem',
                    borderRadius: '20px',
                    textAlign: 'center',
                    maxWidth: '500px',
                    minHeight: '250px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                    border: '2px solid var(--color-primary-light)',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '1.5rem'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Celebration Icon */}
                <div style={{
                    fontSize: '4rem',
                    animation: 'bounce 0.6s infinite'
                }}>
                    🎉
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, var(--color-primary-light), #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                }}>
                    🏆 Correct Answer!
                </h2>

                {/* Message */}
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--color-text-secondary)',
                    margin: 0
                }}>
                    You earned +50 points!
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 2rem',
                        fontSize: '1rem'
                    }}
                >
                    Continue
                </button>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

export default CelebrationModal;
