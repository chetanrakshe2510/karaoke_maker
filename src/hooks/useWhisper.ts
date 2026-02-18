import { useState, useCallback } from 'react';
import { transcribe, isWebGPUAvailable } from '../services/whisper';
import { transcribeWithGroq, isGroqConfigured } from '../services/groq';
import { getMockTranscription } from '../services/huggingface';
import { useAppStore } from '../store/useAppStore';

/**
 * React hook for Whisper transcription.
 *
 * Priority order:
 *   1. Groq API (fastest, ~2-3s) — set VITE_GROQ_API_KEY
 *   2. WebGPU Whisper (local, ~150MB download) — set VITE_ENABLE_WHISPER=true
 *   3. Mock transcription (default fallback)
 */

const USE_REAL_WHISPER = import.meta.env.VITE_ENABLE_WHISPER === 'true';

export function useWhisper() {
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
    const {
        setStage,
        setModelDownloadProgress,
        setSegments,
        setError,
    } = useAppStore();

    const checkWebGPU = useCallback(async () => {
        const supported = await isWebGPUAvailable();
        setWebGPUSupported(supported);
        return supported;
    }, []);

    const runTranscription = useCallback(async (vocalsBlob: Blob, duration?: number, language?: string) => {
        setIsTranscribing(true);
        setError(null);

        try {
            // ─── Path 1: Groq API (fastest) ───
            if (isGroqConfigured()) {
                console.info('✅ Groq configured — using Groq API');

                // Skip model download stage — Groq doesn't need it
                setStage('model-download');
                setModelDownloadProgress({ loaded: 100, total: 100 });
                await new Promise(r => setTimeout(r, 300));

                setStage('transcribing');
                setModelDownloadProgress(null);

                try {
                    const segments = await transcribeWithGroq(vocalsBlob, (message) => {
                        console.info('Groq:', message);
                    }, language);

                    console.info(`✅ Groq returned ${segments.length} segments`);
                    setSegments(segments);
                    setStage('ready');
                    return;
                } catch (groqErr) {
                    const msg = groqErr instanceof Error ? groqErr.message : String(groqErr);
                    console.error('❌ Groq failed:', msg, groqErr);
                    setError(`Groq transcription failed: ${msg}. Using demo lyrics instead.`);
                    // Fall through to mock below
                }
            } else {
                console.info('⚠️ Groq NOT configured — isGroqConfigured() returned false');
            }

            // ─── Path 2: WebGPU Whisper (local) ───
            if (USE_REAL_WHISPER && (await isWebGPUAvailable())) {
                console.info('Using WebGPU Whisper for local transcription');
                setStage('model-download');

                const segments = await transcribe(vocalsBlob, {
                    onModelProgress: (progress) => {
                        setModelDownloadProgress(progress);
                    },
                    onTranscribing: () => {
                        setStage('transcribing');
                        setModelDownloadProgress(null);
                    },
                });

                setStage('transcribing');
                setSegments(segments);
                setStage('ready');
                return;
            }

            // ─── Path 3: Mock transcription (fallback) ───
            console.info('Using mock transcription — set VITE_GROQ_API_KEY for real transcription');
            setStage('model-download');

            // Simulate model download progress
            const totalSteps = 10;
            const totalBytes = 50_000_000;
            for (let i = 1; i <= totalSteps; i++) {
                await new Promise(r => setTimeout(r, 200));
                setModelDownloadProgress({
                    loaded: Math.round((i / totalSteps) * totalBytes),
                    total: totalBytes,
                });
            }

            setStage('transcribing');
            setModelDownloadProgress(null);

            await new Promise(r => setTimeout(r, 1000));

            const mockSegments = getMockTranscription(duration || 60);
            setSegments(mockSegments);
            setStage('ready');

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown transcription error';
            console.error('Transcription failed:', errorMsg, err);

            // Show the error to the user instead of silently falling back
            setError(`Transcription error: ${errorMsg}`);

            // Still fall back to mock so the UI isn't stuck
            setStage('transcribing');
            await new Promise(r => setTimeout(r, 500));
            const mockSegments = getMockTranscription(duration || 60);
            setSegments(mockSegments);
            setStage('ready');
        } finally {
            setIsTranscribing(false);
        }
    }, [setStage, setModelDownloadProgress, setSegments, setError]);

    return {
        runTranscription,
        isTranscribing,
        webGPUSupported,
        checkWebGPU,
    };
}
