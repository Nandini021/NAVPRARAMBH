/**
 * MODULE 10: useResumeCoach Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { resumeCoachStore } from '../store/resumeCoachStore';
import type { ResumeAnalysis } from '../store/resumeCoachStore';

export function useResumeCoach() {
  // resumeCoachStore has no getState() -- it only holds analyses in module
  // scope. Start undefined and let the subscribe callback below populate it
  // once analyze()/analyzeResume() runs.
  const [analysis, setAnalysis] = useState<ResumeAnalysis | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = resumeCoachStore.subscribe((analysis) => {
      setAnalysis(analysis);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const analyze = useCallback((content: string) => {
    return resumeCoachStore.analyzeResume(content);
  }, []);

  const getHighPriority = useCallback(() => {
    return resumeCoachStore.getHighPrioritySuggestions();
  }, []);

  const getHistory = useCallback((limit?: number) => {
    return resumeCoachStore.getHistory(limit);
  }, []);

  const getScoreTrend = useCallback(() => {
    return resumeCoachStore.getScoreTrend();
  }, []);

  return {
    // State
    analysis,
    atsScore: analysis?.atsScore ?? 0,
    suggestions: analysis?.suggestions ?? [],
    strengths: analysis?.strengths ?? [],
    weaknesses: analysis?.weaknesses ?? [],
    // Actions
    analyze,
    getHighPriority,
    getHistory,
    getScoreTrend,
  };
}
