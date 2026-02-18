import { useAppStore } from '../../store/useAppStore';

export function ModelCaching() {
    const progress = useAppStore((s) => s.modelDownloadProgress);

    const loaded = progress ? (progress.loaded / (1024 * 1024)).toFixed(1) : '0';
    const total = progress ? (progress.total / (1024 * 1024)).toFixed(0) : '50';
    const percent = progress ? Math.round((progress.loaded / progress.total) * 100) : 0;

    return (
        <div className="animate-fade-in space-y-6 text-center max-w-sm mx-auto">
            {/* Download icon */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </div>

            <div>
                <h3 className="text-lg font-display font-bold text-indigo-400">
                    Downloading secure, local transcription engine
                </h3>
                <p className="mt-1 text-white font-mono text-sm">
                    {loaded}MB / {total}MB
                </p>
            </div>

            {/* Determinate progress bar */}
            <div className="w-full bg-surface-700 rounded-full h-3 overflow-hidden">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <p className="text-xs text-gray-500 italic">
                ✨ This only happens once! Future songs will be instant.
            </p>
        </div>
    );
}
