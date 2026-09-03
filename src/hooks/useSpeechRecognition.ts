/**
 * MODULE 3: useSpeechRecognition Hook
 * 
 * Speech-to-text integration for voice commands.
 * Uses Web Speech API (with webkit prefix for browser compatibility).
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { emotionStore } from '../store/emotionStore';

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const recognizerRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  // Check if speech recognition is supported
  const isSupported =
    typeof window !== 'undefined' &&
    (Boolean(window.webkitSpeechRecognition) || Boolean(window.SpeechRecognition));

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;

    recognizerRef.current = new SpeechRecognition();
    const recognizer = recognizerRef.current;

    recognizer.continuous = continuous;
    recognizer.interimResults = interimResults;
    recognizer.maxAlternatives = maxAlternatives;
    recognizer.lang = language;

    recognizer.onstart = () => {
      setIsListening(true);
      setError(null);
      emotionStore.getState().startListening();
    };

    recognizer.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      setTranscript((prev) => prev + final);
    };

    recognizer.onerror = (event: { error: string }) => {
      const errorMsg = `Speech recognition error: ${event.error}`;
      setError(errorMsg);
      console.error(errorMsg);
    };

    recognizer.onend = () => {
      setIsListening(false);
      emotionStore.getState().stopListening();
    };

    return () => {
      recognizer.abort();
    };
  }, [continuous, interimResults, language, maxAlternatives, isSupported]);

  const startListening = useCallback(() => {
    if (isSupported && recognizerRef.current) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognizerRef.current.start();
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (isSupported && recognizerRef.current) {
      recognizerRef.current.stop();
    }
  }, [isSupported]);

  const abortListening = useCallback(() => {
    if (isSupported && recognizerRef.current) {
      recognizerRef.current.abort();
    }
  }, [isSupported]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    isSupported: isSupported,
  };
}

