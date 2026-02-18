import { useAppStore } from '../../store/useAppStore';
import { CloudQueue } from './CloudQueue';
import { SourceSeparation } from './SourceSeparation';
import { ModelCaching } from './ModelCaching';
import { LocalTranscription } from './LocalTranscription';

const stageOrder = ['queue', 'separating', 'model-download', 'transcribing'] as const;
const stageLabels: Record<string, string> = {
    queue: 'Cloud Queue',
    separating: 'Separation',
    'model-download': 'Model Download',
    transcribing: 'Transcription',
};

export function LoadingOrchestrator() {
    const stage = useAppStore((s) => s.stage);

    const currentIndex = stageOrder.indexOf(stage as any);

    return (
        <div className="w-full max-w-lg mx-auto px-4 animate-fade-in">
            {/* Stage progress dots */}
            <div className="flex items-center justify-center gap-3 mb-10">
                {stageOrder.map((s, i) => {
                    const isActive = i === currentIndex;
                    const isDone = i < currentIndex;

                    return (
                        <div key={s} className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-3 h-3 rounded-full transition-all duration-500 ${isActive
                                            ? 'bg-neon-cyan shadow-lg shadow-neon-cyan/50 scale-125'
                                            : isDone
                                                ? 'bg-neon-cyan/60'
                                                : 'bg-surface-600'
                                        }`}
                                />
                                <span className={`text-xs font-medium ${isActive ? 'text-neon-cyan' : isDone ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    {stageLabels[s]}
                                </span>
                            </div>
                            {i < stageOrder.length - 1 && (
                                <div
                                    className={`w-8 h-0.5 -mt-5 ${isDone ? 'bg-neon-cyan/40' : 'bg-surface-600'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Active stage content */}
            <div className="glass-panel p-8">
                {stage === 'queue' && <CloudQueue />}
                {stage === 'separating' && <SourceSeparation />}
                {stage === 'model-download' && <ModelCaching />}
                {stage === 'transcribing' && <LocalTranscription />}
            </div>
        </div>
    );
}
