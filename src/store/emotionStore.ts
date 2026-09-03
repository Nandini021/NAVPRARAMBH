/**
 * MODULE 4: EMOTION ENGINE
 * 
 * Manages SIDDHI's emotional states to make her feel alive.
 * Emotions change based on context: idle, happy, thinking, typing, listening, celebrating, focused, concerned, motivating, sleep.
 * 
 * Uses Zustand for state management (lightweight, perfect for React).
 */

export type Emotion = 
  | 'idle' 
  | 'happy' 
  | 'thinking' 
  | 'typing' 
  | 'listening' 
  | 'celebrating' 
  | 'focused' 
  | 'concerned' 
  | 'motivating' 
  | 'sleep';

export interface EmotionState {
  current: Emotion;
  previous: Emotion;
  confidence: number; // 0-1, how certain we are about this emotion
  timestamp: Date;
  trigger?: string; // What caused this emotion change
}

export interface EmotionStore {
  emotion: EmotionState;
  setEmotion: (emotion: Emotion, trigger?: string) => void;
  celebrateScore: (score: number) => void;
  startThinking: () => void;
  startListening: () => void;
  stopListening: () => void;
  showConcern: (reason: string) => void;
  motivate: (message: string) => void;
  sleep: () => void;
  wake: () => void;
  reset: () => void;
}

const defaultState: EmotionState = {
  current: 'idle',
  previous: 'idle',
  confidence: 1,
  timestamp: new Date(),
};

// Simple store implementation (you can replace with Zustand later for more features)
let store: EmotionState = defaultState;
const listeners: Set<(state: EmotionState) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(store));
}

export const emotionStore = {
  // Get current state
  getState: (): EmotionStore => ({
    emotion: { ...store },
    
    // Set emotion explicitly
    setEmotion: (emotion: Emotion, trigger?: string) => {
      store = {
        current: emotion,
        previous: store.current,
        confidence: 0.9,
        timestamp: new Date(),
        trigger,
      };
      notifyListeners();
    },

    // Celebrate high score
    celebrateScore: (score: number) => {
      const emotion = score >= 100 ? 'celebrating' : score >= 80 ? 'happy' : 'happy';
      store = {
        current: emotion,
        previous: store.current,
        confidence: 1,
        timestamp: new Date(),
        trigger: `Score: ${score}%`,
      };
      notifyListeners();
      // Auto-return to idle after 3 seconds
      setTimeout(() => {
        store = { ...store, current: 'idle' };
        notifyListeners();
      }, 3000);
    },

    // Start thinking animation
    startThinking: () => {
      store = {
        current: 'thinking',
        previous: store.current,
        confidence: 0.95,
        timestamp: new Date(),
        trigger: 'Processing input',
      };
      notifyListeners();
    },

    // Start listening
    startListening: () => {
      store = {
        current: 'listening',
        previous: store.current,
        confidence: 1,
        timestamp: new Date(),
        trigger: 'Voice input active',
      };
      notifyListeners();
    },

    // Stop listening
    stopListening: () => {
      store = {
        current: 'thinking',
        previous: store.current,
        confidence: 0.95,
        timestamp: new Date(),
        trigger: 'Processing voice input',
      };
      notifyListeners();
    },

    // Show concern
    showConcern: (reason: string) => {
      store = {
        current: 'concerned',
        previous: store.current,
        confidence: 0.85,
        timestamp: new Date(),
        trigger: reason,
      };
      notifyListeners();
    },

    // Show motivation
    motivate: (message: string) => {
      store = {
        current: 'motivating',
        previous: store.current,
        confidence: 0.9,
        timestamp: new Date(),
        trigger: message,
      };
      notifyListeners();
    },

    // Sleep mode (for animations)
    sleep: () => {
      store = {
        current: 'sleep',
        previous: store.current,
        confidence: 1,
        timestamp: new Date(),
        trigger: 'Idle timeout',
      };
      notifyListeners();
    },

    // Wake up
    wake: () => {
      store = {
        current: 'happy',
        previous: store.current,
        confidence: 1,
        timestamp: new Date(),
        trigger: 'User activity detected',
      };
      notifyListeners();
    },

    // Reset to idle
    reset: () => {
      store = defaultState;
      notifyListeners();
    },
  }),

  // Subscribe to emotion changes
  subscribe: (listener: (state: EmotionState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Get snapshot for React (for use with useSyncExternalStore)
  getSnapshot: () => store,
};
