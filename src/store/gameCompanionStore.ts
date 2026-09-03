/**
 * MODULE 11: GAME COMPANION
 * 
 * SIDDHI becomes a game coach.
 * Celebrates wins, encourages on failures.
 * Tracks XP and achievements.
 */

export type GameType = 'quiz' | 'coding' | 'puzzle' | 'case-study';

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface GameSession {
  id: string;
  gameType: GameType;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  xpEarned: number;
  streakMaintained: boolean;
  hintsUsed: number;
  achievements: GameAchievement[];
}

interface GameCompanionStore {
  totalXP: number;
  level: number; // Calculated from XP
  streak: number; // Current win streak
  bestStreak: number;
  achievements: GameAchievement[];
  sessions: GameSession[];
  currentSession?: GameSession;
}

const XP_PER_LEVEL = 1000;

const store: GameCompanionStore = {
  totalXP: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  achievements: [],
  sessions: [],
  currentSession: undefined,
};

const listeners: Set<(session: GameSession | undefined) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(store.currentSession));
}

/**
 * Calculate level from XP
 */
function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP earned based on score
 */
function calculateXP(score: number, maxScore: number, gameType: GameType): number {
  let baseXP = Math.round((score / maxScore) * 100);

  // Bonus multipliers
  if (gameType === 'coding') baseXP *= 1.5;
  if (gameType === 'case-study') baseXP *= 1.3;

  // Perfect score bonus
  if (score === maxScore) baseXP *= 1.5;

  return baseXP;
}

/**
 * Check for achievements
 */
function checkAchievements(session: GameSession): GameAchievement[] {
  const newAchievements: GameAchievement[] = [];

  // Perfect score
  if (session.score === session.maxScore) {
    newAchievements.push({
      id: `ach_perfect_${Date.now()}`,
      name: 'Perfect Score',
      description: 'Achieved 100% on a game',
      icon: '💯',
      unlockedAt: new Date(),
      rarity: 'rare',
    });
  }

  // Win streak
  if (store.streak >= 5) {
    newAchievements.push({
      id: `ach_streak_${Date.now()}`,
      name: `${store.streak} Win Streak!`,
      description: `Won ${store.streak} games in a row`,
      icon: '🔥',
      unlockedAt: new Date(),
      rarity: store.streak >= 10 ? 'legendary' : 'uncommon',
    });
  }

  // No hints used
  if (session.hintsUsed === 0) {
    newAchievements.push({
      id: `ach_no_hints_${Date.now()}`,
      name: 'Self Reliant',
      description: 'Completed without using hints',
      icon: '💪',
      unlockedAt: new Date(),
      rarity: 'uncommon',
    });
  }

  // Game type specific
  if (session.gameType === 'coding' && session.score >= 90) {
    newAchievements.push({
      id: `ach_coder_${Date.now()}`,
      name: 'Code Master',
      description: 'Solved a coding challenge with 90%+',
      icon: '👨‍💻',
      unlockedAt: new Date(),
      rarity: 'rare',
    });
  }

  return newAchievements;
}

export const gameCompanionStore = {
  /**
   * Start a new game session
   */
  startGame: (gameType: GameType): GameSession => {
    const session: GameSession = {
      id: `game_${Date.now()}`,
      gameType,
      startTime: new Date(),
      score: 0,
      maxScore: 100,
      xpEarned: 0,
      streakMaintained: false,
      hintsUsed: 0,
      achievements: [],
    };

    store.currentSession = session;
    notifyListeners();

    return session;
  },

  /**
   * Complete game session
   */
  completeGame: (score: number, hintsUsed: number = 0): GameSession | undefined => {
    if (!store.currentSession) return undefined;

    store.currentSession.endTime = new Date();
    store.currentSession.score = score;
    store.currentSession.hintsUsed = hintsUsed;

    // Calculate XP
    const xp = calculateXP(score, store.currentSession.maxScore, store.currentSession.gameType);
    store.currentSession.xpEarned = xp;

    // Update total XP
    store.totalXP += xp;
    store.level = calculateLevel(store.totalXP);

    // Update streak
    if (score >= 80) {
      store.streak++;
      store.currentSession.streakMaintained = true;

      if (store.streak > store.bestStreak) {
        store.bestStreak = store.streak;
      }
    } else {
      store.streak = 0;
    }

    // Check achievements
    const achievements = checkAchievements(store.currentSession);
    store.currentSession.achievements = achievements;
    store.achievements.push(...achievements);

    // Store session
    store.sessions.push(store.currentSession);

    const completedSession = store.currentSession;
    store.currentSession = undefined;

    notifyListeners();

    return completedSession;
  },

  /**
   * Use a hint
   */
  useHint: (): boolean => {
    if (!store.currentSession) return false;
    store.currentSession.hintsUsed++;
    return true;
  },

  /**
   * Get current stats
   */
  getStats: () => ({
    totalXP: store.totalXP,
    level: store.level,
    streak: store.streak,
    bestStreak: store.bestStreak,
    achievementCount: store.achievements.length,
    gamesPlayed: store.sessions.length,
    averageScore: store.sessions.length > 0
      ? Math.round(
          store.sessions.reduce((sum, s) => sum + s.score, 0) / store.sessions.length
        )
      : 0,
  }),

  /**
   * Get achievements
   */
  getAchievements: (): GameAchievement[] => [...store.achievements],

  /**
   * Get session history
   */
  getHistory: (gameType?: GameType, limit: number = 10): GameSession[] => {
    let sessions = store.sessions;
    if (gameType) {
      sessions = sessions.filter(s => s.gameType === gameType);
    }
    return sessions.slice(-limit);
  },

  /**
   * Get XP progress to next level
   */
  getXPProgress: (): { current: number; needed: number; percentage: number } => {
    const currentLevelXP = (store.level - 1) * XP_PER_LEVEL;
    const nextLevelXP = store.level * XP_PER_LEVEL;
    const current = store.totalXP - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    const percentage = Math.round((current / needed) * 100);

    return { current, needed, percentage };
  },

  /**
   * Subscribe to changes
   */
  subscribe: (listener: (session: GameSession | undefined) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
