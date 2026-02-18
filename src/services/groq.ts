import type { LyricSegment } from '../store/useAppStore';

/**
 * Groq Whisper API for blazing-fast transcription (~2-3 seconds).
 * Uses whisper-large-v3-turbo for the best speed/quality balance.
 *
 * Get a free API key at: https://console.groq.com
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Use Vite's dev proxy to bypass CORS (see vite.config.ts)
const GROQ_API_URL = '/api/groq/openai/v1/audio/transcriptions';

// Groq free tier limit is 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface GroqWord {
    word: string;
    start: number;
    end: number;
}

interface GroqSegment {
    id: number;
    text: string;
    start: number;
    end: number;
}

interface GroqResponse {
    text: string;
    segments?: GroqSegment[];
    words?: GroqWord[];
}

/**
 * Check if Groq API is configured.
 */
export function isGroqConfigured(): boolean {
    return GROQ_API_KEY.trim().length > 0;
}

/**
 * Detect the best file extension from a blob's MIME type.
 */
function getExtension(blob: Blob): string {
    const type = blob.type.toLowerCase();
    if (type.includes('mp3') || type.includes('mpeg')) return 'mp3';
    if (type.includes('wav') || type.includes('wave')) return 'wav';
    if (type.includes('ogg')) return 'ogg';
    if (type.includes('flac')) return 'flac';
    if (type.includes('webm')) return 'webm';
    if (type.includes('mp4') || type.includes('m4a')) return 'm4a';
    return 'mp3';
}

/**
 * Downsample audio to 16kHz mono WAV to reduce file size.
 * Whisper internally downsamples to 16kHz anyway, so no quality loss.
 */
async function compressAudio(blob: Blob): Promise<Blob> {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Mix to mono
    const monoData = new Float32Array(audioBuffer.length);
    const channels = audioBuffer.numberOfChannels;
    for (let i = 0; i < audioBuffer.length; i++) {
        let sum = 0;
        for (let ch = 0; ch < channels; ch++) {
            sum += audioBuffer.getChannelData(ch)[i];
        }
        monoData[i] = sum / channels;
    }

    // Resample to 16kHz
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * 16000), 16000);
    const source = offlineCtx.createBufferSource();
    const newBuffer = offlineCtx.createBuffer(1, monoData.length, audioBuffer.sampleRate);
    newBuffer.copyToChannel(monoData, 0);
    source.buffer = newBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const samples = renderedBuffer.getChannelData(0);

    // Encode as 16-bit PCM WAV
    const wavBuffer = encodeWAV(samples, 16000);
    await audioContext.close();

    return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Encode samples as a WAV file.
 */
function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = samples.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
    }

    return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

/**
 * Transcribe audio using Groq's Whisper API.
 * Returns timestamped segments for lyric display.
 */
export async function transcribeWithGroq(
    audioBlob: Blob,
    onProgress?: (message: string) => void,
    language?: string,
    quality?: 'fast' | 'accurate'
): Promise<LyricSegment[]> {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
    }

    const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(1);
    console.info(`[Groq] Input audio: ${sizeMB}MB, type="${audioBlob.type}"`);

    let fileToSend: Blob = audioBlob;
    let fileName: string;

    // Compress if file is too large or is an uncompressed format
    if (audioBlob.size > MAX_FILE_SIZE || audioBlob.type.includes('wav')) {
        onProgress?.(`Audio is ${sizeMB}MB — compressing to 16kHz WAV...`);
        console.info('[Groq] Compressing audio to 16kHz mono WAV...');

        try {
            fileToSend = await compressAudio(audioBlob);
            const newSizeMB = (fileToSend.size / (1024 * 1024)).toFixed(1);
            console.info(`[Groq] Compressed: ${sizeMB}MB → ${newSizeMB}MB`);
            fileName = 'audio.wav';
        } catch (err) {
            console.warn('[Groq] Compression failed, using original:', err);
            const ext = getExtension(audioBlob);
            fileName = `audio.${ext}`;
        }
    } else {
        const ext = getExtension(audioBlob);
        fileName = `audio.${ext}`;
    }

    // Final size check
    if (fileToSend.size > MAX_FILE_SIZE) {
        throw new Error(`Audio file too large (${(fileToSend.size / (1024 * 1024)).toFixed(1)}MB). Groq limit is 25MB.`);
    }

    onProgress?.('Sending to Groq Whisper API...');
    console.info(`[Groq] Uploading ${(fileToSend.size / (1024 * 1024)).toFixed(1)}MB as "${fileName}"...`);

    // Build form data
    const formData = new FormData();
    const audioFile = new File([fileToSend], fileName, {
        type: fileToSend.type || 'audio/wav',
    });

    // Select model based on quality preference
    const model = quality === 'fast' ? 'whisper-large-v3-turbo' : 'whisper-large-v3';
    console.info(`[Groq] Using model: ${model} (${quality || 'accurate'} mode)`);

    formData.append('file', audioFile);
    formData.append('model', model);
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');
    formData.append('timestamp_granularities[]', 'word');

    // Pass language hint for better accuracy (empty = auto-detect)
    if (language) {
        formData.append('language', language);
        console.info(`[Groq] Language hint: ${language}`);
    } else {
        console.info('[Groq] Language: auto-detect');
    }


    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Groq] API error ${response.status}:`, errorBody);
        throw new Error(`Groq API error (${response.status}): ${errorBody}`);
    }

    const data: GroqResponse = await response.json();
    console.info('[Groq] Response:', {
        text: data.text?.substring(0, 100),
        segmentCount: data.segments?.length,
    });

    onProgress?.('Processing transcription...');

    // Convert Groq segments to our LyricSegment format
    // Attach word-level timestamps to each segment for word-by-word highlighting
    if (data.segments && data.segments.length > 0) {
        const allWords = data.words || [];
        console.info(`[Groq] Got ${allWords.length} word timestamps`);

        const segments = data.segments
            .filter((seg) => seg.text.trim().length > 0)
            .map((seg) => {
                // Find words that fall within this segment's time range
                const segWords = allWords
                    .filter((w) => w.start >= seg.start - 0.05 && w.end <= seg.end + 0.05)
                    .map((w) => ({
                        word: w.word.trim(),
                        start: w.start,
                        end: w.end,
                    }));

                return {
                    text: seg.text.trim(),
                    start: seg.start,
                    end: seg.end,
                    words: segWords.length > 0 ? segWords : undefined,
                };
            });
        console.info(`[Groq] ✅ Got ${segments.length} lyric segments with word timestamps`);
        return segments;
    }

    // Fallback: split text into lines if no timestamps
    if (data.text && data.text.trim().length > 0) {
        console.warn('[Groq] No segments, splitting text into lines');
        const lines = data.text.split(/[.!?\n]+/).filter((l) => l.trim().length > 0);
        const segDuration = 5;
        return lines.map((line, i) => ({
            text: line.trim(),
            start: i * segDuration,
            end: (i + 1) * segDuration,
        }));
    }

    throw new Error('No transcription returned from Groq');
}

// Chat completion for LLM post-processing
const GROQ_CHAT_URL = '/api/groq/openai/v1/chat/completions';

/**
 * Use Llama 3 via Groq to polish lyrics.
 * Fixes spelling, punctuation, and capitalization while preserving timestamps.
 */
export async function cleanLyricsWithGroq(
    segments: LyricSegment[],
    onProgress?: (message: string) => void
): Promise<LyricSegment[]> {
    if (!GROQ_API_KEY) throw new Error('Groq API key missing');

    onProgress?.('✨ AI Polishing lyrics...');
    console.info('[Groq] Starting Llama 3 lyric polish...');

    // Prepare payload - we need to send words if they exist, or text if not
    // To save tokens, we'll strip unnecessary fields
    const payload = segments.map((s) => ({
        text: s.text,
        words: s.words?.map((w) => ({ w: w.word, s: w.start, e: w.end })), // Shorten keys to save tokens
    }));

    const systemPrompt = `
You are a professional lyric editor. Your job is to fix spelling, punctuation, capitalization, and grammar in the provided song lyrics.
CRITICAL INSTRUCTIONS:
1. Return EXACTLY the same JSON structure as input.
2. Fix the "text" field for readability.
3. Fix the "w" (word) fields in the "words" array for synchronization.
4. DO NOT change any "s" (start) or "e" (end) timestamps.
5. DO NOT add or remove words. The number of word objects must remain exactly the same.
6. Return ONLY valid JSON. No markdown, no explanations.
`.trim();

    try {
        const response = await fetch(GROQ_CHAT_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify(payload) },
                ],
                temperature: 0.1, // Low temperature for deterministic formatting
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            throw new Error(`Llama 3 API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) throw new Error('Empty response from Llama 3');

        // Parse cleaned data
        const cleanedData = JSON.parse(content);

        // Handle case where LLM wraps response in a key like "lyrics" or just returns array
        const cleanedSegments = Array.isArray(cleanedData)
            ? cleanedData
            : cleanedData.segments || cleanedData.lyrics || Object.values(cleanedData)[0];

        if (!Array.isArray(cleanedSegments)) {
            console.warn('[Groq] LLM returned unexpected format, using original:', cleanedData);
            return segments;
        }

        // Rehydrate the segments (map back 'w', 's', 'e' to 'word', 'start', 'end')
        const processedSegments: LyricSegment[] = cleanedSegments.map((s: any, i: number) => {
            const original = segments[i];

            // Validate timestamps didn't break
            if (!s.words || s.words.length !== original.words?.length) {
                console.warn(`[Groq] Segment ${i} word count mismatch (orig: ${original.words?.length}, new: ${s.words?.length}). Using original.`);
                return original;
            }

            return {
                text: s.text || original.text,
                start: original.start, // Trust original timestamps over LLM
                end: original.end,
                words: s.words.map((w: any) => ({
                    word: w.w,
                    start: w.s,
                    end: w.e,
                })),
            };
        });

        console.info('[Groq] ✨ Lyrics polished successfully!');
        return processedSegments;

    } catch (err) {
        console.error('[Groq] Polish failed:', err);
        return segments; // Fallback to original
    }
}
