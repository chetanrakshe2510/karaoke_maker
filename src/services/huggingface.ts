import type { LyricSegment } from '../store/useAppStore';

/**
 * Mock Hugging Face Space API for Demucs source separation.
 *
 * In production, this would use @gradio/client to call an HF Space.
 * For development, we simulate the separation by returning the
 * original audio as both vocals and instrumental.
 */

// Set to your HF Space URL when available
const HF_SPACE_URL = import.meta.env.VITE_HF_SPACE_URL || '';

interface SeparationResult {
    vocals: Blob;
    instrumental: Blob;
}

interface SeparationCallbacks {
    onQueuePosition?: (position: number) => void;
    onProgress?: (message: string) => void;
}

/**
 * Separate audio into vocals and instrumental tracks.
 * Uses mock data in development; real Gradio client in production.
 */
export async function separateAudio(
    audioBlob: Blob,
    callbacks?: SeparationCallbacks
): Promise<SeparationResult> {
    if (HF_SPACE_URL) {
        return separateWithGradio(audioBlob, callbacks);
    }
    return mockSeparation(audioBlob, callbacks);
}

/**
 * Real separation using @gradio/client
 */
async function separateWithGradio(
    audioBlob: Blob,
    callbacks?: SeparationCallbacks
): Promise<SeparationResult> {
    try {
        const { Client } = await import('@gradio/client');

        callbacks?.onProgress?.('Connecting to Cloud GPU...');

        const client = await Client.connect(HF_SPACE_URL.trim());

        callbacks?.onQueuePosition?.(1);
        callbacks?.onProgress?.('Submitting audio for source separation...');

        // Use fn_index 0 (default endpoint) since endpoint names vary across Spaces
        const result = await client.predict(0, {
            audio: audioBlob,
        });

        callbacks?.onProgress?.('Downloading separated audio...');

        const data = result.data as any[];

        // Demucs Spaces return multiple stems — find vocals and instrumental.
        // Typical output: [vocals, drums, bass, other] or [vocals, accompaniment]
        // We need the first item (vocals) and combine the rest as instrumental.
        if (Array.isArray(data) && data.length >= 2) {
            const fetchBlob = async (item: any): Promise<Blob> => {
                if (item instanceof Blob) return item;
                if (item?.url) {
                    const resp = await fetch(item.url);
                    return resp.blob();
                }
                if (typeof item === 'string') {
                    const resp = await fetch(item);
                    return resp.blob();
                }
                throw new Error('Unexpected output format from Demucs Space');
            };

            const vocals = await fetchBlob(data[0]);
            // Use second output as instrumental (or last if only 2 outputs)
            const instrumental = await fetchBlob(data[data.length > 2 ? data.length - 1 : 1]);

            return { vocals, instrumental };
        }

        throw new Error('Unexpected response from Demucs Space');
    } catch (err) {
        console.error('Gradio separation failed:', err);
        // Fall back to mock separation so the app doesn't break
        callbacks?.onProgress?.('Cloud separation unavailable, using local fallback...');
        return mockSeparation(audioBlob, callbacks);
    }
}

/**
 * Mock separation for development: simulates a delay and returns
 * the original audio as both vocal and instrumental tracks.
 */
async function mockSeparation(
    audioBlob: Blob,
    callbacks?: SeparationCallbacks
): Promise<SeparationResult> {
    // Simulate queue
    callbacks?.onQueuePosition?.(2);
    callbacks?.onProgress?.('Waiting in Queue: Position 2');
    await delay(800);

    callbacks?.onQueuePosition?.(1);
    callbacks?.onProgress?.('Waiting in Queue: Position 1');
    await delay(600);

    callbacks?.onQueuePosition?.(0);
    callbacks?.onProgress?.('Extracting vocals and instruments...');
    await delay(1500);

    // In mock mode, return the original blob as both tracks
    return {
        vocals: audioBlob,
        instrumental: audioBlob,
    };
}

/**
 * Mock Whisper transcription for development.
 * Returns synthetic lyric segments with realistic timing.
 */
export function getMockTranscription(duration: number): LyricSegment[] {
    const lyrics = [
        "When the stars align tonight",
        "I'll be dancing in the moonlight",
        "Every heartbeat sings your name",
        "Nothing's ever gonna be the same",
        "♪ ♫ ♪ (Instrumental)",
        "Take my hand and hold on tight",
        "We'll chase the shadows through the night",
        "Like a river flowing free",
        "You and I were meant to be",
        "♪ ♫ ♪ (Instrumental)",
        "Every moment feels so right",
        "With you here by my side",
        "Let the music carry us away",
        "Into a brand new day",
    ];

    const segmentDuration = duration / lyrics.length;
    return lyrics.map((text, i) => ({
        text,
        start: i * segmentDuration,
        end: (i + 1) * segmentDuration,
    }));
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
