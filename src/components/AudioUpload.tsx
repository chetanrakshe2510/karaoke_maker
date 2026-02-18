import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useDemucs } from '../hooks/useDemucs';
import { useWhisper } from '../hooks/useWhisper';

export function AudioUpload() {
    const { setAudioFile, setStage } = useAppStore();
    const { separate } = useDemucs();
    const { runTranscription } = useWhisper();

    const handleFile = useCallback(async (file: File) => {
        setAudioFile(file);
        setStage('queue');

        try {
            // Step 1: Source separation
            const audioBlob = new Blob([await file.arrayBuffer()], { type: file.type });
            const result = await separate(audioBlob);

            // Step 2: Transcription (uses vocals from separation)
            // Get a rough duration estimate from the file
            const tempAudio = new Audio(URL.createObjectURL(audioBlob));
            await new Promise<void>((resolve) => {
                tempAudio.addEventListener('loadedmetadata', () => resolve());
                tempAudio.load();
            });
            const duration = tempAudio.duration;
            URL.revokeObjectURL(tempAudio.src);

            await runTranscription(result.vocals, duration);
        } catch (err) {
            console.error('Pipeline error:', err);
        }
    }, [setAudioFile, setStage, separate, runTranscription]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div className="w-full max-w-lg mx-auto px-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="glass-panel p-12 text-center cursor-pointer group hover:border-neon-cyan/40 transition-all duration-300"
                onClick={() => document.getElementById('audio-input')?.click()}
            >
                {/* Upload icon */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-surface-700 flex items-center justify-center mb-6 group-hover:bg-surface-600 transition-colors">
                    <svg className="w-10 h-10 text-gray-400 group-hover:text-neon-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
                    </svg>
                </div>

                <h3 className="text-xl font-display font-bold text-gray-200 mb-2">
                    Drop your audio file here
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                    or click to browse — supports MP3, WAV, OGG, FLAC
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-cyan/10 text-neon-cyan text-sm font-semibold group-hover:bg-neon-cyan/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Choose File
                </div>

                <input
                    id="audio-input"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </div>
        </div>
    );
}
