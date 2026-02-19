import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useDemucs } from '../hooks/useDemucs';
import { useWhisper } from '../hooks/useWhisper';

const LANGUAGES = [
    { code: '', label: '🌐 Auto-Detect' },
    { code: 'hi', label: '🇮🇳 Hindi' },
    { code: 'en', label: '🇬🇧 English' },
    { code: 'es', label: '🇪🇸 Spanish' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'de', label: '🇩🇪 German' },
    { code: 'ja', label: '🇯🇵 Japanese' },
    { code: 'ko', label: '🇰🇷 Korean' },
    { code: 'pt', label: '🇧🇷 Portuguese' },
    { code: 'ar', label: '🇸🇦 Arabic' },
    { code: 'zh', label: '🇨🇳 Chinese' },
    { code: 'ru', label: '🇷🇺 Russian' },
    { code: 'ta', label: '🇮🇳 Tamil' },
    { code: 'te', label: '🇮🇳 Telugu' },
    { code: 'bn', label: '🇮🇳 Bengali' },
    { code: 'mr', label: '🇮🇳 Marathi' },
    { code: 'gu', label: '🇮🇳 Gujarati' },
    { code: 'pa', label: '🇮🇳 Punjabi' },
    { code: 'ur', label: '🇵🇰 Urdu' },
    { code: 'it', label: '🇮🇹 Italian' },
    { code: 'tr', label: '🇹🇷 Turkish' },
    { code: 'th', label: '🇹🇭 Thai' },
];

export function AudioUpload() {
    const { setAudioFile, setStage } = useAppStore();
    const selectedLanguage = useAppStore((s) => s.selectedLanguage);
    const setSelectedLanguage = useAppStore((s) => s.setSelectedLanguage);
    const transcriptionQuality = useAppStore((s) => s.transcriptionQuality);
    const setTranscriptionQuality = useAppStore((s) => s.setTranscriptionQuality);
    const isPostProcessingEnabled = useAppStore((s) => s.isPostProcessingEnabled);
    const setPostProcessingEnabled = useAppStore((s) => s.setPostProcessingEnabled);
    const songMetadata = useAppStore((s) => s.songMetadata);
    const setSongMetadata = useAppStore((s) => s.setSongMetadata);
    const lyricSource = useAppStore((s) => s.lyricSource);
    const setLyricSource = useAppStore((s) => s.setLyricSource);
    const pastedLyrics = useAppStore((s) => s.pastedLyrics);
    const setPastedLyrics = useAppStore((s) => s.setPastedLyrics);
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
            const tempAudio = new Audio(URL.createObjectURL(audioBlob));
            await new Promise<void>((resolve) => {
                tempAudio.addEventListener('loadedmetadata', () => resolve());
                tempAudio.load();
            });
            const duration = tempAudio.duration;
            URL.revokeObjectURL(tempAudio.src);

            // Pass the selected language and quality to transcription
            await runTranscription(result.vocals, duration, selectedLanguage, transcriptionQuality);
        } catch (err) {
            console.error('Pipeline error:', err);
        }
    }, [setAudioFile, setStage, separate, runTranscription, selectedLanguage, transcriptionQuality]);

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
        <div className="w-full max-w-lg mx-auto px-4 space-y-6">
            {/* Song Metadata Section */}
            <div className="bg-surface-800/50 rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-200">Song Details <span className="text-gray-500 font-normal">(Recommended)</span></h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Song Title"
                        value={songMetadata.title}
                        onChange={(e) => setSongMetadata({ ...songMetadata, title: e.target.value })}
                        className="bg-surface-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Artist"
                        value={songMetadata.artist}
                        onChange={(e) => setSongMetadata({ ...songMetadata, artist: e.target.value })}
                        className="bg-surface-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                    />
                </div>

                {/* Lyric Source Selector */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium ml-1">Lyric Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'auto', label: '👂 Transcribe', icon: 'Microphone' },
                            { id: 'ai-recall', label: '🧠 AI Recall', icon: 'Sparkles' },
                            { id: 'paste', label: '📋 Paste', icon: 'Clipboard' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setLyricSource(opt.id as any)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-xs font-medium transition-all ${lyricSource === opt.id
                                        ? 'bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                                        : 'bg-surface-700/30 border-transparent text-gray-400 hover:bg-surface-700/50 hover:text-gray-300'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Paste Area */}
                {lyricSource === 'paste' && (
                    <textarea
                        value={pastedLyrics}
                        onChange={(e) => setPastedLyrics(e.target.value)}
                        placeholder="Paste lyrics here..."
                        className="w-full h-32 bg-surface-900/50 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neon-cyan/30 resize-none"
                    />
                )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-center gap-3">
                <label htmlFor="lang-select" className="text-sm text-gray-400 font-medium whitespace-nowrap">
                    Song Language
                </label>
                <select
                    id="lang-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-surface-700/80 text-gray-200 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/40 cursor-pointer appearance-none hover:border-white/20 transition-colors min-w-[180px]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px',
                        paddingRight: '36px',
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Quality Toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-gray-400 font-medium">Quality</span>
                <div className="inline-flex rounded-xl bg-surface-700/80 border border-white/10 p-1">
                    <button
                        onClick={() => setTranscriptionQuality('fast')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${transcriptionQuality === 'fast'
                            ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        ⚡ Fast
                    </button>
                    <button
                        onClick={() => setTranscriptionQuality('accurate')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${transcriptionQuality === 'accurate'
                            ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        🎯 Accurate
                    </button>
                </div>
                <span className="text-xs text-gray-500">
                    {transcriptionQuality === 'fast' ? '~2-3s' : '~5-8s'}
                </span>
            </div>

            {/* AI Polish Toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-gray-400 font-medium">AI Polish</span>
                <button
                    onClick={() => setPostProcessingEnabled(!isPostProcessingEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 ${isPostProcessingEnabled ? 'bg-neon-cyan' : 'bg-surface-600'
                        }`}
                >
                    <span
                        className={`${isPostProcessingEnabled ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
                <span className="text-xs text-yellow-400 font-medium">
                    {isPostProcessingEnabled ? '✨ Fixes spelling' : 'Off'}
                </span>
            </div>

            {/* Upload Area */}
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
