import { useState, useCallback } from 'react';
import { separateAudio } from '../services/huggingface';
import { useAppStore } from '../store/useAppStore';

/**
 * React hook for Demucs source separation via HF Space.
 */
export function useDemucs() {
    const [isProcessing, setIsProcessing] = useState(false);
    const {
        setStage,
        setQueuePosition,
        setVocalsBlob,
        setInstrumentalBlob,
        setError,
    } = useAppStore();

    const separate = useCallback(async (audioBlob: Blob) => {
        setIsProcessing(true);
        setError(null);
        setStage('queue');

        try {
            const result = await separateAudio(audioBlob, {
                onQueuePosition: (pos) => {
                    setQueuePosition(pos);
                },
                onProgress: (msg) => {
                    if (msg.includes('Extracting')) {
                        setStage('separating');
                        setQueuePosition(null);
                    }
                },
            });

            setVocalsBlob(result.vocals);
            setInstrumentalBlob(result.instrumental);

            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Source separation failed';
            setError(message);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    }, [setStage, setQueuePosition, setVocalsBlob, setInstrumentalBlob, setError]);

    return { separate, isProcessing };
}
