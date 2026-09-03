/**
 * SIDDHI AI MODULE EXPORTS
 * 
 * Main entry point for all SIDDHI components and hooks.
 */

// Module 1: Avatar System
export { Avatar } from './Avatar';
export { getExpression } from './AvatarExpressions';
export type { AvatarExpression } from './AvatarExpressions';

// Module 2: Chat Engine
export { ChatPanel } from './chat/ChatPanel';
export { ChatMessage } from './chat/ChatMessage';
export { ChatInput } from './chat/ChatInput';
export { TypingIndicator } from './chat/TypingIndicator';

// Module 3: Voice Engine
export { VoiceVisualizer } from './VoiceVisualizer';

// Module 8: Notification Engine
export { ToastNotification } from './notifications/Toast';
export { NotificationContainer } from './notifications/NotificationContainer';

// Stores (Modules 4, 5, 6, 7, 8, 9, 10, 11)
export { emotionStore } from '../../store/emotionStore';
export { memoryStore } from '../../store/memoryStore';
export { activityTracker } from '../../store/activityStore';
export { recommendationStore } from '../../store/recommendationStore';
export { notificationStore } from '../../store/notificationStore';
export { interviewStore } from '../../store/interviewStore';
export { resumeCoachStore } from '../../store/resumeCoachStore';
export { gameCompanionStore } from '../../store/gameCompanionStore';

// Hooks (All Modules)
export { useEmotion } from '../../hooks/useEmotion';
export { useMemory } from '../../hooks/useMemory';
export { useActivity } from '../../hooks/useActivity';
export { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
export { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
export { useRecommendation } from '../../hooks/useRecommendation';
export { useNotification } from '../../hooks/useNotification';
export { useInterviewCoach } from '../../hooks/useInterviewCoach';
export { useResumeCoach } from '../../hooks/useResumeCoach';
export { useGameCompanion } from '../../hooks/useGameCompanion';

// Types
export type { Emotion, EmotionState } from '../../store/emotionStore';
export type { ConversationMemory, ChatMessage as ChatMessageType } from '../../store/memoryStore';
export type { Activity, ActivityType, CurrentTask } from '../../store/activityStore';
export type {
  Recommendation,
  RecommendationType,
  RecommendationContext,
} from '../../store/recommendationStore';
export type { Notification, NotificationType } from '../../store/notificationStore';
export type {
  InterviewSession,
  InterviewQuestion,
  InterviewMode,
  InterviewStatus,
} from '../../store/interviewStore';
export type { ResumeAnalysis, ResumeSuggestion } from '../../store/resumeCoachStore';
export type { GameSession, GameAchievement, GameType } from '../../store/gameCompanionStore';
