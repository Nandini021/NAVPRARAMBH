/**
 * MODULE 3: useSpeechSynthesis Hook
 * 
 * Text-to-speech integration for SIDDHI.
 * Uses Web Speech API.
 */

import { useRef, useCallback } from 'react';

interface SpeechSynthesisOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  language?: string;
}

export function useSpeechSynthesis(options: SpeechSynthesisOptions = {}) {
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    language = 'en-US',
  } = options;

  // Check if speech synthesis is supported
  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Speech Synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = language;

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, language, isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const isSpeaking = useCallback(() => {
    return isSupported && window.speechSynthesis.speaking;
  }, [isSupported]);

  const isPaused = useCallback(() => {
    return isSupported && window.speechSynthesis.paused;
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported: isSupported,
  };
}

