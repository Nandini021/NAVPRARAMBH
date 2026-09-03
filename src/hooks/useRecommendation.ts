/**
 * MODULE 7: useRecommendation Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { recommendationStore } from '../store/recommendationStore';
import type { Recommendation, RecommendationContext, RecommendationType } from '../store/recommendationStore';

export function useRecommendation() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    recommendationStore.getState().recommendations
  );

  useEffect(() => {
    const unsubscribe = recommendationStore.subscribe((state) => {
      setRecommendations(state.recommendations);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const updateContext = useCallback((context: Partial<RecommendationContext>) => {
    recommendationStore.updateContext(context);
  }, []);

  const generate = useCallback((customRecs?: Recommendation[]) => {
    return recommendationStore.generateRecommendations(customRecs);
  }, []);

  const getByType = useCallback((type: RecommendationType) => {
    return recommendationStore.getByType(type);
  }, []);

  const getTop = useCallback((count: number = 3) => {
    return recommendationStore.getTop(count);
  }, []);

  const markActioned = useCallback((id: string) => {
    recommendationStore.actioned(id);
  }, []);

  return {
    recommendations,
    updateContext,
    generate,
    getByType,
    getTop,
    markActioned,
  };
}
