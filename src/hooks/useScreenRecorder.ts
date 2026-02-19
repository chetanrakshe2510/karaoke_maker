import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook to record screen and audio using the MediaRecorder API.
 * Captures system audio (if shared) + screen video.
 */
export function useScreenRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            // Prompt user to select screen & share audio
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: 60, // Smooth animation
                },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                }
            });

            // Check if user shared audio
            const audioTracks = displayStream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.warn('No system audio shared. The recording will be silent.');
                // We could alert the user here, but for now we proceed
            }

            const options = { mimeType: 'video/webm;codecs=vp9,opus' };
            const recorder = new MediaRecorder(displayStream, options);

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordingBlob(blob);

                // Stop all tracks to clear the "sharing" indicator
                displayStream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                setIsRecording(false);
            };

            // Handle user clicking "Stop sharing" in browser UI
            displayStream.getVideoTracks()[0].onended = () => {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            streamRef.current = displayStream;
            setIsRecording(true);
            setRecordingBlob(null);

        } catch (err) {
            console.error('Error starting screen recording:', err);
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const downloadRecording = useCallback(() => {
        if (!recordingBlob) return;

        const url = URL.createObjectURL(recordingBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `karaoke-performance-${new Date().toISOString().slice(0, 10)}.webm`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }, [recordingBlob]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordingBlob,
        downloadRecording,
    };
}
