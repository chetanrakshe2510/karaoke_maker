export function PolishingStage() {
    return (
        <div className="animate-fade-in space-y-6 text-center">
            {/* Sparkle animation */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-neon-cyan/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-surface-800 rounded-full p-4 border border-neon-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <svg
                        className="w-8 h-8 text-neon-cyan animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                    </svg>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-display font-bold text-neon-cyan neon-glow-cyan">
                    Polishing Lyrics...
                </h3>
                <p className="mt-2 text-gray-400 text-sm">
                    AI is fixing spelling & punctuation
                </p>
            </div>
        </div>
    );
}
