import { useAppStore } from '../store/useAppStore';

export function Header() {
    const stage = useAppStore((s) => s.stage);
    const reset = useAppStore((s) => s.reset);

    return (
        <header className="w-full px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Logo / Brand */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-indigo-600 flex items-center justify-center shadow-lg shadow-neon-cyan/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                </div>
                <div>
                    <h1 className="font-display font-black text-xl tracking-tight">
                        <span className="text-gradient">Karaok</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                        Edge AI Karaoke
                    </p>
                </div>
            </div>

            {/* Reset button (only visible when not idle) */}
            {stage !== 'idle' && (
                <button
                    onClick={reset}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-surface-700 transition-all"
                >
                    New Song
                </button>
            )}
        </header>
    );
}
