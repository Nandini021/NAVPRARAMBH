/**
 * MODULE 9: useInterviewCoach Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { interviewStore } from '../store/interviewStore';
import type { InterviewSession, InterviewQuestion, InterviewMode } from '../store/interviewStore';

export function useInterviewCoach() {
  const [session, setSession] = useState<InterviewSession | undefined>(undefined);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | undefined>(
    interviewStore.getCurrentQuestion?.()
  );

  useEffect(() => {
    const unsubscribe = interviewStore.subscribe((sess) => {
      setSession(sess);
      setCurrentQuestion(interviewStore.getCurrentQuestion?.());
    });

    return unsubscribe;
  }, []);

  const start = useCallback(
    (mode: InterviewMode, company: string, position: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
      return interviewStore.startInterview(mode, company, position, difficulty);
    },
    []
  );

  const submitAnswer = useCallback((answer: string, feedback?: string, score?: number) => {
    interviewStore.submitAnswer(answer, feedback, score);
  }, []);

  const nextQuestion = useCallback(() => {
    return interviewStore.nextQuestion();
  }, []);

  const pause = useCallback(() => {
    interviewStore.pauseInterview();
  }, []);

  const resume = useCallback(() => {
    interviewStore.resumeInterview();
  }, []);

  const end = useCallback(() => {
    return interviewStore.endInterview();
  }, []);

  const getHistory = useCallback((limit?: number) => {
    return interviewStore.getHistory(limit);
  }, []);

  const getAverageScore = useCallback(() => {
    return interviewStore.getAverageScore();
  }, []);

  return {
    // State
    session,
    currentQuestion,
    isInProgress: session?.status === 'in-progress',
    isPaused: session?.status === 'paused',
    isCompleted: session?.status === 'completed',
    // Actions
    start,
    submitAnswer,
    nextQuestion,
    pause,
    resume,
    end,
    getHistory,
    getAverageScore,
  };
}
