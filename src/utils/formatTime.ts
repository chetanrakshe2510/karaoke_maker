/**
 * Format seconds to mm:ss display string.
 */
export function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Calculate the fill percentage for a lyric segment
 * based on the current playback time.
 */
export function calculateFillPercentage(
    currentTime: number,
    segmentStart: number,
    segmentEnd: number
): number {
    if (currentTime <= segmentStart) return 0;
    if (currentTime >= segmentEnd) return 100;
    const duration = segmentEnd - segmentStart;
    if (duration <= 0) return 100;
    return ((currentTime - segmentStart) / duration) * 100;
}
