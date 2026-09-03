/**
 * MODULE 5: useMemory Hook
 * 
 * Access SIDDHI's memory throughout the application.
 * Automatically loads from localStorage on first use.
 */

import { useEffect, useState, useCallback } from 'react';
import { memoryStore } from '../store/memoryStore';
import type { ChatMessage, ConversationMemory } from '../store/memoryStore';

export function useMemory() {
  const [memory, setMemory] = useState<ConversationMemory>(memoryStore.getState());

  useEffect(() => {
    const unsubscribe = memoryStore.subscribe(setMemory);
    return unsubscribe;
  }, []);

  const addMessage = useCallback((role: 'user' | 'ai', content: string, metadata?: Record<string, unknown>) => {
    return memoryStore.addMessage(role, content, metadata);
  }, []);

  const getMessages = useCallback((limit?: number): ChatMessage[] => {
    return memoryStore.getMessages(limit);
  }, []);

  const setUserProfile = useCallback((userId: string, userName: string, userEmail: string) => {
    memoryStore.setUserProfile(userId, userName, userEmail);
  }, []);

  const startInterview = useCallback((jobTitle: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    return memoryStore.startInterview(jobTitle, difficulty);
  }, []);

  const addInterviewQuestion = useCallback((question: string, userAnswer: string, feedback: string, score: number) => {
    memoryStore.addInterviewQuestion(question, userAnswer, feedback, score);
  }, []);

  const endInterview = useCallback((score: number) => {
    memoryStore.endInterview(score);
  }, []);

  const addQuizResult = useCallback((quizId: string, topic: string, score: number, maxScore: number, answers: Record<string, string>) => {
    memoryStore.addQuizResult(quizId, topic, score, maxScore, answers);
  }, []);

  const updateResume = useCallback((content: string, score: number, feedback: string) => {
    memoryStore.updateResume(content, score, feedback);
  }, []);

  const addActivity = useCallback((action: string, metadata?: Record<string, unknown>) => {
    memoryStore.addActivity(action, metadata);
  }, []);

  const getActivity = useCallback((limit: number = 20) => {
    return memoryStore.getActivity(limit);
  }, []);

  const clearMemory = useCallback(() => {
    memoryStore.clearMemory();
  }, []);

  return {
    // State
    messages: memory.messages,
    userName: memory.userName,
    userEmail: memory.userEmail,
    currentInterview: memory.currentInterviewSession,
    interviewHistory: memory.interviewHistory,
    quizProgress: memory.quizProgress,
    resume: memory.resume,
    recentActivity: memory.recentActivity,
    lastUpdated: memory.lastUpdated,
    // Actions
    addMessage,
    getMessages,
    setUserProfile,
    startInterview,
    addInterviewQuestion,
    endInterview,
    addQuizResult,
    updateResume,
    addActivity,
    getActivity,
    clearMemory,
  };
}
