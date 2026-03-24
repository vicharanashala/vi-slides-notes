import React, { useState, useEffect } from 'react';

interface FloatingEmoji {
    id: string;
    emoji: string;
    left: number;
}

interface ReactionOverlayProps {
    socketService: any;
}

const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ socketService }) => {
    const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

    useEffect(() => {
        socketService.onStreamEmoji((data: any) => {
            console.log('🚀 Received emoji event:', data);
            const newEmoji = {
                id: data.id,
                emoji: data.emoji,
                left: Math.random() * 85 + 5 // Random horizontal position 5% to 90%
            };
            setEmojis(prev => [...prev, newEmoji]);

            // Remove emoji after animation completes
            setTimeout(() => {
                setEmojis(prev => prev.filter(e => e.id !== data.id));
            }, 4000);
        });

        return () => socketService.offStreamEmoji();
    }, [socketService]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 99999, // Ensure it's above almost everything
            overflow: 'hidden'
        }}>
            {emojis.map(e => (
                <div
                    key={e.id}
                    className="floating-emoji"
                    style={{
                        position: 'absolute',
                        bottom: '20px', // Start slightly above bottom to ensure visibility
                        left: `${e.left}%`,
                        fontSize: '3rem', // Slightly larger
                        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))', // Add glow for visibility
                        animation: 'floatUp 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                        userSelect: 'none',
                        zIndex: 100000
                    }}
                >
                    {e.emoji}
                </div>
            ))}
            <style>{`
                @keyframes floatUp {
                    0% {
                        transform: translateY(0) scale(0.5);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                        transform: translateY(-50px) scale(1.4);
                    }
                    80% {
                        opacity: 1;
                        transform: translateY(-80vh) scale(1.1) rotate(15deg);
                    }
                    100% {
                        transform: translateY(-100vh) scale(0.8) rotate(30deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReactionOverlay;
