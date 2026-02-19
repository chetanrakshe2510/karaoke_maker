import type { LyricSegment } from '../store/useAppStore';



/**
 * Aligns clean lyrics (from AI Recall or Paste) to noisy transcription timestamps.
 * Uses a forward-scan anchoring algorithm to match words and interpolate timing.
 */
export function alignLyrics(noisySegments: LyricSegment[], cleanText: string): LyricSegment[] {
    // 1. Flatten noisy segments into a linear timeline of words
    const noisyWords: { text: string; start: number; end: number }[] = [];
    noisySegments.forEach(seg => {
        const segDuration = seg.end - seg.start;
        const charDuration = segDuration / seg.text.length;
        let currentStart = seg.start;

        // If segment has word-level timestamps, use them
        if (seg.words && seg.words.length > 0) {
            seg.words.forEach(w => {
                noisyWords.push({
                    text: normalize(w.word),
                    start: w.start,
                    end: w.end
                });
            });
        } else {
            // Fallback: splitting segment text and estimating time
            const words = seg.text.split(/\s+/);
            words.forEach(w => {
                const duration = w.length * charDuration;
                noisyWords.push({
                    text: normalize(w),
                    start: currentStart,
                    end: currentStart + duration
                });
                currentStart += duration;
            });
        }
    });

    // 2. Tokenize clean text into lines and words
    const cleanLines = cleanText.split('\n').filter(line => line.trim().length > 0);
    const alignedSegments: LyricSegment[] = [];

    let noisyIndex = 0;

    cleanLines.forEach(line => {
        const cleanWords = line.split(/\s+/).map(w => ({ text: w, normalized: normalize(w) }));
        const lineWords: { word: string; start: number; end: number }[] = [];

        // Try to match each clean word to a noisy word with lookahead
        cleanWords.forEach((cleanWord) => {
            let matchFound = false;
            // Look ahead up to 10 words or until end
            const lookahead = 15;
            for (let j = 0; j < lookahead && (noisyIndex + j) < noisyWords.length; j++) {
                const noisyWord = noisyWords[noisyIndex + j];

                // Fuzzy match (very simple check for now)
                if (isMatch(cleanWord.normalized, noisyWord.text)) {
                    lineWords.push({
                        word: cleanWord.text,
                        start: noisyWord.start,
                        end: noisyWord.end
                    });
                    noisyIndex += j + 1; // Advance past this match
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                // If no match, add placeholder (will interpolate later)
                lineWords.push({
                    word: cleanWord.text,
                    start: -1,
                    end: -1
                });
            }
        });

        if (lineWords.length > 0) {
            alignedSegments.push({
                text: line,
                start: 0, // Will fix
                end: 0,   // Will fix
                words: lineWords
            });
        }
    });

    // 3. Interpolate missing timestamps
    let lastEnd = noisySegments[0]?.start || 0;

    // Flatten all aligned words mainly to interpolate
    const allAlignedWords = alignedSegments.flatMap(s => s.words!);

    // Find anchors (words with valid timestamps)
    for (let i = 0; i < allAlignedWords.length; i++) {
        if (allAlignedWords[i].start === -1) {
            // Find next anchor
            let nextAnchorIndex = -1;
            for (let j = i + 1; j < allAlignedWords.length; j++) {
                if (allAlignedWords[j].start !== -1) {
                    nextAnchorIndex = j;
                    break;
                }
            }

            const prevEnd = i > 0 ? allAlignedWords[i - 1].end : lastEnd;
            const nextStart = nextAnchorIndex !== -1 ? allAlignedWords[nextAnchorIndex].start : (allAlignedWords[allAlignedWords.length - 1]?.end || prevEnd + 5);

            // Distribute time evenly among missing words
            const gap = nextStart - prevEnd;
            const missingCount = (nextAnchorIndex !== -1 ? nextAnchorIndex : allAlignedWords.length) - i;
            const durationPerWord = gap / missingCount;

            allAlignedWords[i].start = prevEnd;
            allAlignedWords[i].end = prevEnd + durationPerWord;
        }
        lastEnd = allAlignedWords[i].end;
    }

    // 4. Update segment start/end based on words
    alignedSegments.forEach(seg => {
        if (seg.words && seg.words.length > 0) {
            seg.start = seg.words[0].start;
            seg.end = seg.words[seg.words.length - 1].end;
        }
    });

    return alignedSegments;
}

function normalize(s: string): string {
    return s.toLowerCase().replace(/[^\w\s]|_/g, "");
}

function isMatch(a: string, b: string): boolean {
    if (a === b) return true;
    if (a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a))) return true;
    return false;
}
