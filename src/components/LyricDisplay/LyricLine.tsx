import { useMemo } from 'react';
import { calculateFillPercentage } from '../../utils/formatTime';

interface LyricLineProps {
    text: string;
    start: number;
    end: number;
    currentTime: number;
    isActive: boolean;
    isPast: boolean;
}

export function LyricLine({ text, start, end, currentTime, isActive, isPast }: LyricLineProps) {
    const fillPercent = useMemo(
        () => calculateFillPercentage(currentTime, start, end),
        [currentTime, start, end]
    );

    const isInstrumental = text.includes('♪') || text.toLowerCase().includes('instrumental');

    if (isInstrumental && isActive) {
        // Instrumental countdown bar
        return (
            <div className="py-4 animate-fade-in">
                <p className="text-lg font-display font-bold text-neon-pink/60 mb-3 text-center">
                    {text}
                </p>
                <div className="w-48 mx-auto bg-surface-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan transition-none"
                        style={{ width: `${100 - fillPercent}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`py-2 transition-all duration-300 ${isActive ? 'scale-105 origin-left' : ''
                } ${isPast ? 'opacity-30' : ''}`}
        >
            <p
                className={`text-3xl md:text-4xl font-display font-black tracking-tight leading-snug ${isActive ? '' : isPast ? 'text-gray-600' : 'text-gray-200 drop-shadow-xl'
                    }`}
                style={
                    isActive
                        ? {
                            background: `linear-gradient(90deg, #facc15 ${fillPercent}%, #9ca3af ${fillPercent}%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: fillPercent > 0 ? `drop-shadow(0 0 ${8 + fillPercent * 0.12}px rgba(250, 204, 21, ${0.3 + fillPercent * 0.004}))` : undefined,
                        }
                        : undefined
                }
            >
                {text}
            </p>
        </div>
    );
}
