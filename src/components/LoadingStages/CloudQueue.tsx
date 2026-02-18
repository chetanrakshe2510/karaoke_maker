import { useAppStore } from '../../store/useAppStore';

export function CloudQueue() {
    const queuePosition = useAppStore((s) => s.queuePosition);

    return (
        <div className="animate-fade-in space-y-6 text-center">
            {/* Animated cloud icon */}
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-ping" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full glass-panel">
                    <svg className="w-12 h-12 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                    </svg>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-display font-bold text-neon-cyan neon-glow-cyan">
                    Connecting to Cloud GPU...
                </h3>
                {queuePosition !== null && queuePosition > 0 ? (
                    <p className="mt-2 text-gray-400 font-medium">
                        Waiting in Queue: <span className="text-white font-bold">Position {queuePosition}</span>
                    </p>
                ) : (
                    <p className="mt-2 text-gray-400 text-sm">
                        Waking up server (this may take up to 60s)
                    </p>
                )}
            </div>
        </div>
    );
}
