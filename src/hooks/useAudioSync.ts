import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * React hook that syncs an HTML audio element's playback
 * with the Zustand store's currentTime for lyric animation.
 */
export function useAudioSync() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const { setCurrentTime, setDuration, setIsPlaying } = useAppStore();

    const syncTime = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
        rafRef.current = requestAnimationFrame(syncTime);
    }, [setCurrentTime]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            rafRef.current = requestAnimationFrame(syncTime);
        }
    }, [setIsPlaying, syncTime]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
    }, [setIsPlaying]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, [setCurrentTime]);

    const toggle = useCallback(() => {
        if (audioRef.current?.paused) {
            play();
        } else {
            pause();
        }
    }, [play, pause]);

    // Set up audio element event listeners
    const setAudioElement = useCallback((audio: HTMLAudioElement | null) => {
        // Clean up old element
        if (audioRef.current) {
            audioRef.current.removeEventListener('loadedmetadata', handleMetadata);
            audioRef.current.removeEventListener('ended', handleEnded);
        }

        audioRef.current = audio;

        if (audio) {
            audio.addEventListener('loadedmetadata', handleMetadata);
            audio.addEventListener('ended', handleEnded);
        }

        function handleMetadata() {
            if (audio) setDuration(audio.duration);
        }

        function handleEnded() {
            setIsPlaying(false);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
    }, [setDuration, setIsPlaying]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return {
        setAudioElement,
        play,
        pause,
        seek,
        toggle,
        audioRef,
    };
}
