/**
 * MODULE 11: useGameCompanion Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { gameCompanionStore } from '../store/gameCompanionStore';
import type { GameSession, GameType } from '../store/gameCompanionStore';

export function useGameCompanion() {
  const [session, setSession] = useState<GameSession | undefined>(undefined);
  const [stats, setStats] = useState(gameCompanionStore.getStats());
  const [xpProgress, setXPProgress] = useState(gameCompanionStore.getXPProgress());

  useEffect(() => {
    const unsubscribe = gameCompanionStore.subscribe((sess) => {
      setSession(sess);
      setStats(gameCompanionStore.getStats());
      setXPProgress(gameCompanionStore.getXPProgress());
    });

    return unsubscribe;
  }, []);

  const startGame = useCallback((gameType: GameType) => {
    return gameCompanionStore.startGame(gameType);
  }, []);

  const completeGame = useCallback((score: number, hintsUsed?: number) => {
    return gameCompanionStore.completeGame(score, hintsUsed);
  }, []);

  const useHint = useCallback(() => {
    return gameCompanionStore.useHint();
  }, []);

  const getAchievements = useCallback(() => {
    return gameCompanionStore.getAchievements();
  }, []);

  const getHistory = useCallback((gameType?: GameType, limit?: number) => {
    return gameCompanionStore.getHistory(gameType, limit);
  }, []);

  return {
    // State
    session,
    stats,
    xpProgress,
    isPlaying: session !== undefined,
    // Actions
    startGame,
    completeGame,
    useHint,
    getAchievements,
    getHistory,
  };
}
