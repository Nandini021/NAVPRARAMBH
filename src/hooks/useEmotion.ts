/**
 * MODULE 4: useEmotion Hook
 * 
 * React hook to use SIDDHI's emotion state throughout the application.
 * Automatically subscribes and unsubscribes from emotion changes.
 */

import { useEffect, useState, useCallback } from 'react';
import { emotionStore } from '../store/emotionStore';
import type { Emotion, EmotionState } from '../store/emotionStore';

export function useEmotion() {
  const [emotion, setEmotion] = useState<EmotionState>(emotionStore.getSnapshot());

  useEffect(() => {
    const unsubscribe = emotionStore.subscribe(setEmotion);
    return unsubscribe;
  }, []);

  const celebrateScore = useCallback((score: number) => {
    emotionStore.getState().celebrateScore(score);
  }, []);

  const startThinking = useCallback(() => {
    emotionStore.getState().startThinking();
  }, []);

  const startListening = useCallback(() => {
    emotionStore.getState().startListening();
  }, []);

  const stopListening = useCallback(() => {
    emotionStore.getState().stopListening();
  }, []);

  const showConcern = useCallback((reason: string) => {
    emotionStore.getState().showConcern(reason);
  }, []);

  const motivate = useCallback((message: string) => {
    emotionStore.getState().motivate(message);
  }, []);

  const setEmotionDirect = useCallback((newEmotion: Emotion, trigger?: string) => {
    emotionStore.getState().setEmotion(newEmotion, trigger);
  }, []);

  const sleep = useCallback(() => {
    emotionStore.getState().sleep();
  }, []);

  const wake = useCallback(() => {
    emotionStore.getState().wake();
  }, []);

  const reset = useCallback(() => {
    emotionStore.getState().reset();
  }, []);

  return {
    emotion: emotion.current,
    previousEmotion: emotion.previous,
    confidence: emotion.confidence,
    trigger: emotion.trigger,
    // Direct control
    setEmotion: setEmotionDirect,
    celebrateScore,
    startThinking,
    startListening,
    stopListening,
    showConcern,
    motivate,
    sleep,
    wake,
    reset,
  };
}
