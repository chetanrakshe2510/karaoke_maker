export function SourceSeparation() {
    return (
        <div className="animate-fade-in space-y-6 text-center">
            {/* Equalizer animation */}
            <div className="flex items-end justify-center gap-1.5 h-20 mx-auto">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="eq-bar"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            height: `${30 + Math.random() * 50}%`,
                        }}
                    />
                ))}
            </div>

            <div>
                <h3 className="text-xl font-display font-bold text-neon-cyan neon-glow-cyan">
                    Extracting vocals and instruments...
                </h3>
                <p className="mt-2 text-gray-400 text-sm">
                    AI is separating the music layers
                </p>
            </div>
        </div>
    );
}
