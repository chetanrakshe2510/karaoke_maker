import { create } from 'zustand';

export type PipelineStage =
    | 'idle'
    | 'queue'
    | 'separating'
    | 'model-download'
    | 'transcribing'
    | 'ready';

export interface WordTimestamp {
    word: string;
    start: number;
    end: number;
}

export interface LyricSegment {
    text: string;
    start: number; // seconds
    end: number;   // seconds
    words?: WordTimestamp[];
}

interface AppState {
    // Pipeline
    stage: PipelineStage;
    queuePosition: number | null;
    modelDownloadProgress: { loaded: number; total: number } | null;
    error: string | null;

    // Audio
    audioFile: File | null;
    vocalsBlob: Blob | null;
    instrumentalBlob: Blob | null;
    instrumentalUrl: string | null;

    // Lyrics
    segments: LyricSegment[];
    selectedLanguage: string; // ISO 639-1 code, '' = auto-detect
    transcriptionQuality: 'fast' | 'accurate';

    // Playback
    isPlaying: boolean;
    currentTime: number;
    duration: number;

    // Actions
    setStage: (stage: PipelineStage) => void;
    setQueuePosition: (pos: number | null) => void;
    setModelDownloadProgress: (progress: { loaded: number; total: number } | null) => void;
    setError: (error: string | null) => void;
    setAudioFile: (file: File | null) => void;
    setVocalsBlob: (blob: Blob | null) => void;
    setInstrumentalBlob: (blob: Blob | null) => void;
    setInstrumentalUrl: (url: string | null) => void;
    setSegments: (segments: LyricSegment[]) => void;
    setSelectedLanguage: (lang: string) => void;
    setTranscriptionQuality: (quality: 'fast' | 'accurate') => void;
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    reset: () => void;
}

const initialState = {
    stage: 'idle' as PipelineStage,
    queuePosition: null,
    modelDownloadProgress: null,
    error: null,
    audioFile: null,
    vocalsBlob: null,
    instrumentalBlob: null,
    instrumentalUrl: null,
    segments: [],
    selectedLanguage: '',
    transcriptionQuality: 'accurate' as const,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
};

export const useAppStore = create<AppState>((set) => ({
    ...initialState,

    setStage: (stage) => set({ stage }),
    setQueuePosition: (queuePosition) => set({ queuePosition }),
    setModelDownloadProgress: (modelDownloadProgress) => set({ modelDownloadProgress }),
    setError: (error) => set({ error }),
    setAudioFile: (audioFile) => set({ audioFile }),
    setVocalsBlob: (vocalsBlob) => set({ vocalsBlob }),
    setInstrumentalBlob: (instrumentalBlob) => set({ instrumentalBlob }),
    setInstrumentalUrl: (instrumentalUrl) => set({ instrumentalUrl }),
    setSegments: (segments) => set({ segments }),
    setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
    setTranscriptionQuality: (transcriptionQuality) => set({ transcriptionQuality }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    reset: () => set(initialState),
}));
