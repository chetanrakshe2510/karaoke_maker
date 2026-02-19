import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAudioSync } from '../hooks/useAudioSync';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { formatTime } from '../utils/formatTime';

export function Player() {
    const {
        instrumentalBlob,
        vocalsBlob,
        isPlaying,
        currentTime,
        duration,
        performanceMetrics,
    } = useAppStore();

    const [showStats, setShowStats] = useState(false);

    const { setAudioElement, toggle, seek } = useAudioSync();
    const { isRecording, startRecording, stopRecording, recordingBlob, downloadRecording } = useScreenRecorder();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Create object URL for the audio blob
    const [audioSrc, setAudioSrc] = useState<string>('');

    // Create and cleanup object URL for the audio blob
    useEffect(() => {
        const blob = instrumentalBlob || vocalsBlob;
        if (!blob) {
            setAudioSrc('');
            return;
        }

        const url = URL.createObjectURL(blob);
        setAudioSrc(url);

        return () => {
            URL.revokeObjectURL(url);
        };
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

                    {/* Recording Controls */}
                    <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                        {!recordingBlob ? (
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse'
                                    : 'bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-white'
                                    }`}
                                title={isRecording ? 'Stop Recording' : 'Record Video'}
                            >
                                {isRecording ? (
                                    <div className="w-3 h-3 rounded-sm bg-current" />
                                ) : (
                                    <div className="w-3 h-3 rounded-full bg-current" />
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={downloadRecording}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Toggle */}
            <button
                onClick={() => setShowStats(!showStats)}
                className="absolute top-3 right-3 p-1.5 text-gray-600 hover:text-neon-cyan transition-colors z-20"
                title="Performance Analytics"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Stats Dashboard */}
            {showStats && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                        <span className="text-neon-cyan">⚡</span>
                        <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Pipeline Stats</h4>
                    </div>
                    <div className="space-y-2 text-xs font-mono text-gray-400">
                        <div className="flex justify-between items-center">
                            <span>Separation</span>
                            <span className="text-gray-200">{performanceMetrics.separationTime ? (performanceMetrics.separationTime / 1000).toFixed(1) + 's' : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Transcription</span>
                            <span className={performanceMetrics.transcriptionTime && performanceMetrics.transcriptionTime < 3000 ? "text-green-400" : "text-gray-200"}>
                                {performanceMetrics.transcriptionTime ? (performanceMetrics.transcriptionTime / 1000).toFixed(1) + 's' : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Polish/Align</span>
                            <span className="text-gray-200">{performanceMetrics.polishingTime ? (performanceMetrics.polishingTime / 1000).toFixed(1) + 's' : '-'}</span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-white/10 flex justify-between items-center font-bold text-neon-pink">
                            <span>Total Time</span>
                            <span>{performanceMetrics.totalTime ? (performanceMetrics.totalTime / 1000).toFixed(1) + 's' : '-'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
