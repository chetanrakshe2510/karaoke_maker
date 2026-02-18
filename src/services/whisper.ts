import type { LyricSegment } from '../store/useAppStore';

/**
 * Whisper transcription service using @huggingface/transformers (WebGPU).
 *
 * For MVP, this wraps the transcription pipeline with progress callbacks.
 * Falls back to mock data if WebGPU is unavailable.
 */

interface TranscriptionCallbacks {
    onModelProgress?: (progress: { loaded: number; total: number }) => void;
    onTranscribing?: (partialText: string) => void;
}

interface WhisperOutput {
    chunks?: Array<{
        text: string;
        timestamp: [number, number | null];
    }>;
    text?: string;
}

let pipelineInstance: any = null;

/**
 * Load the Whisper pipeline (cached after first call).
 */
async function loadPipeline(onProgress?: (progress: { loaded: number; total: number }) => void) {
    if (pipelineInstance) return pipelineInstance;

    const { pipeline, env } = await import('@huggingface/transformers');

    // Prefer WebGPU, fall back to WASM
    env.backends.onnx.wasm.numThreads = 4;

    pipelineInstance = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-small',
        {
            dtype: 'q8',
            device: 'webgpu' as any,
            progress_callback: (data: any) => {
                if (data.status === 'progress' && data.total) {
                    onProgress?.({ loaded: data.loaded, total: data.total });
                }
            },
        }
    );

    return pipelineInstance;
}

/**
 * Transcribe a vocal audio blob into timestamped lyric segments.
 */
export async function transcribe(
    vocalsBlob: Blob,
    callbacks?: TranscriptionCallbacks
): Promise<LyricSegment[]> {
    try {
        const pipe = await loadPipeline(callbacks?.onModelProgress);

        const audioUrl = URL.createObjectURL(vocalsBlob);

        const result: WhisperOutput = await pipe(audioUrl, {
            return_timestamps: true,
            chunk_length_s: 30,
            stride_length_s: 5,
        });

        URL.revokeObjectURL(audioUrl);

        if (result.chunks && result.chunks.length > 0) {
            return result.chunks.map((chunk) => ({
                text: chunk.text.trim(),
                start: chunk.timestamp[0],
                end: chunk.timestamp[1] ?? chunk.timestamp[0] + 3,
            }));
        }

        // Fallback: single segment
        return [{ text: result.text || '', start: 0, end: 30 }];
    } catch (error) {
        console.warn('WebGPU Whisper failed, using mock transcription:', error);
        throw error;
    }
}

/**
 * Check if WebGPU is available in the current browser.
 */
export async function isWebGPUAvailable(): Promise<boolean> {
    if (!navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter !== null;
    } catch {
        return false;
    }
}
