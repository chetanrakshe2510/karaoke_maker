import { useMemo } from 'react';
import type { WordTimestamp } from '../../store/useAppStore';

interface LyricLineProps {
    text: string;
    start: number;
    end: number;
    currentTime: number;
    isActive: boolean;
    isPast: boolean;
    words?: WordTimestamp[];
}

/**
 * Get the highlight state for a word:
 *  - 'sung': word has been fully sung (golden, full glow)
 *  - 'singing': word is currently being sung (golden, pulsing glow)
 *  - 'upcoming': word hasn't been sung yet (dim gray)
 */
function getWordState(
    currentTime: number,
    wordStart: number,
    wordEnd: number
): 'sung' | 'singing' | 'upcoming' {
    if (currentTime >= wordEnd) return 'sung';
    if (currentTime >= wordStart) return 'singing';
    return 'upcoming';
}

export function LyricLine({ text, start, end, currentTime, isActive, isPast, words }: LyricLineProps) {
    const isInstrumental = text.includes('♪') || text.toLowerCase().includes('instrumental');

    // Fallback fill for gradient mode (when no word timestamps)
    const fillPercent = useMemo(() => {
        if (currentTime <= start) return 0;
        if (currentTime >= end) return 100;
        return ((currentTime - start) / (end - start)) * 100;
    }, [currentTime, start, end]);

    if (isInstrumental && isActive) {
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

    // ─── Word-by-word highlighting (when word timestamps are available) ───
    if (isActive && words && words.length > 0) {
        return (
            <div className="py-2 scale-105 origin-left transition-all duration-300">
                <p className="text-3xl md:text-4xl font-display font-black tracking-tight leading-snug">
                    {words.map((w, i) => {
                        const state = getWordState(currentTime, w.start, w.end);
                        return (
                            <span
                                key={i}
                                className={`inline-block transition-all duration-150 ${state === 'singing'
                                        ? 'text-yellow-400 scale-110'
                                        : state === 'sung'
                                            ? 'text-yellow-400/90'
                                            : 'text-gray-400'
                                    }`}
                                style={
                                    state === 'singing'
                                        ? {
                                            filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.6))',
                                            transform: 'scale(1.08)',
                                        }
                                        : state === 'sung'
                                            ? {
                                                filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.25))',
                                            }
                                            : undefined
                                }
                            >
                                {w.word}
                            </span>
                        );
                    })}
                </p>
            </div>
        );
    }

    // ─── Fallback: gradient fill on entire line (no word timestamps) ───
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
