import { useAppStore } from '../../store/useAppStore';

export function LocalTranscription() {
    const segments = useAppStore((s) => s.segments);

    return (
        <div className="animate-fade-in space-y-6 text-center">
            {/* Terminal-style display */}
            <div className="mx-auto max-w-md glass-panel p-4 font-mono text-xs text-left">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-500 ml-2">whisper-webgpu</span>
                </div>

                <div className="space-y-1 max-h-32 overflow-hidden">
                    <p className="text-green-400">
                        <span className="text-gray-600">$</span> Running local AI transcription...
                    </p>
                    {segments.slice(0, 5).map((seg, i) => (
                        <p key={i} className="text-gray-300 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                            <span className="text-neon-cyan">[{seg.start.toFixed(1)}s]</span>{' '}
                            {seg.text}
                        </p>
                    ))}
                    {segments.length === 0 && (
                        <p className="text-gray-500 animate-pulse">Processing audio data...</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-display font-bold text-green-400">
                    Transcribing with local AI ⚡
                </h3>
                <p className="mt-1 text-gray-400 text-sm">
                    Running directly on your device — private &amp; fast
                </p>
            </div>
        </div>
    );
}
