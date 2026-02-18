import { useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LyricLine } from './LyricLine';

export function LyricContainer() {
    const segments = useAppStore((s) => s.segments);
    const currentTime = useAppStore((s) => s.currentTime);
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the active segment index
    const activeIndex = useMemo(() => {
        for (let i = 0; i < segments.length; i++) {
            if (currentTime >= segments[i].start && currentTime < segments[i].end) {
                return i;
            }
        }
        // If past all segments, return last
        if (segments.length > 0 && currentTime >= segments[segments.length - 1].end) {
            return segments.length - 1;
        }
        return 0;
    }, [segments, currentTime]);

    // Look-ahead buffer: show lines around the active line
    const visibleRange = useMemo(() => {
        const lookBehind = 1;
        const lookAhead = 2;
        const start = Math.max(0, activeIndex - lookBehind);
        const end = Math.min(segments.length, activeIndex + lookAhead + 1);
        return { start, end };
    }, [activeIndex, segments.length]);

    // Auto-scroll to keep active line centered
    useEffect(() => {
        if (containerRef.current) {
            const activeEl = containerRef.current.querySelector('[data-active="true"]');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeIndex]);

    if (segments.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 font-display text-xl">
                No lyrics to display
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-2xl mx-auto px-6 py-8 overflow-hidden"
            style={{ minHeight: '300px' }}
        >
            {/* Gradient fade at top and bottom */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface-900 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-900 to-transparent z-10" />

            <div className="space-y-1">
                {segments.slice(visibleRange.start, visibleRange.end).map((seg, relIdx) => {
                    const absoluteIdx = visibleRange.start + relIdx;
                    const isActive = absoluteIdx === activeIndex;
                    const isPast = absoluteIdx < activeIndex;

                    return (
                        <div key={absoluteIdx} data-active={isActive}>
                            <LyricLine
                                text={seg.text}
                                start={seg.start}
                                end={seg.end}
                                currentTime={currentTime}
                                isActive={isActive}
                                isPast={isPast}
                                words={seg.words}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
