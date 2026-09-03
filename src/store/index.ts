/**
 * STORE EXPORTS
 * 
 * All state management stores for SIDDHI AI.
 */

export { emotionStore } from './emotionStore';
export type { Emotion, EmotionState, EmotionStore } from './emotionStore';

export { memoryStore } from './memoryStore';
export type {
  ConversationMemory,
  ChatMessage,
  QuizProgress,
  Resume,
} from './memoryStore';

export { activityTracker } from './activityStore';
export type { Activity, ActivityType, CurrentTask, ActivityStore } from './activityStore';

// Module 7: Recommendation Engine
export { recommendationStore } from './recommendationStore';
export type {
  Recommendation,
  RecommendationType,
  RecommendationContext,
} from './recommendationStore';

// Module 8: Notification Engine
export { notificationStore } from './notificationStore';
export type { Notification, NotificationType } from './notificationStore';

// Module 9: Interview Coach
export { interviewStore } from './interviewStore';
export type {
  InterviewSession,
  InterviewQuestion,
  InterviewMode,
  InterviewStatus,
} from './interviewStore';

// Module 10: Resume Coach
export { resumeCoachStore } from './resumeCoachStore';
export type { ResumeAnalysis, ResumeSuggestion } from './resumeCoachStore';

// Module 11: Game Companion
export { gameCompanionStore } from './gameCompanionStore';
export type { GameSession, GameAchievement, GameType } from './gameCompanionStore';
