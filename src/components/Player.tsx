import { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAudioSync } from '../hooks/useAudioSync';
import { formatTime } from '../utils/formatTime';

export function Player() {
    const {
        instrumentalBlob,
        vocalsBlob,
        isPlaying,
        currentTime,
        duration,
    } = useAppStore();

    const { setAudioElement, toggle, seek } = useAudioSync();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Create object URL for the audio blob
    const audioSrc = useMemo(() => {
        // Use instrumental for karaoke (vocals removed)
        const blob = instrumentalBlob || vocalsBlob;
        if (!blob) return '';
        return URL.createObjectURL(blob);
    }, [instrumentalBlob, vocalsBlob]);

    // Connect audio element to sync hook
    useEffect(() => {
        setAudioElement(audioRef.current);
        return () => setAudioElement(null);
    }, [setAudioElement, audioSrc]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        seek(percent * duration);
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <audio ref={audioRef} src={audioSrc} preload="auto" />

            <div className="glass-panel p-4">
                {/* Progress bar */}
                <div
                    className="w-full h-2 bg-surface-700 rounded-full cursor-pointer mb-4 group"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-indigo-500 to-neon-pink transition-none relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Time display */}
                    <span className="text-xs font-mono text-gray-500 w-16">
                        {formatTime(currentTime)}
                    </span>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        {/* Rewind 5s */}
                        <button
                            onClick={() => seek(Math.max(0, currentTime - 5))}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Rewind 5s"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062a1.125 1.125 0 011.683.977v8.123z" />
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={toggle}
                            className="w-14 h-14 rounded-full bg-neon-cyan flex items-center justify-center hover:bg-neon-cyan/80 transition-all shadow-lg shadow-neon-cyan/30 active:scale-95"
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6 text-surface-900" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-surface-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Forward 5s */}
                        <button
                            onClick={() => seek(Math.min(duration, currentTime + 5))}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Forward 5s"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.811V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                            </svg>
                        </button>
                    </div>

                    {/* Duration */}
                    <span className="text-xs font-mono text-gray-500 w-16 text-right">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
