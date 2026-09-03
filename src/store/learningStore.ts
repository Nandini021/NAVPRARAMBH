/**
 * STUDENT DASHBOARD: LEARNING STORE
 *
 * Backs Module 7 (Learning Progress). Same vanilla subscribe/notify pattern
 * as emotionStore.ts / recommendationStore.ts / applicationStore.ts.
 *
 * Also becomes the real source for the "weakest subject" signal that Module
 * 3 (AIRecommendations.tsx) previously hard-coded -- see getWeakestTrack().
 */

export interface LearningTrack {
  id: string;
  label: string;
  progress: number; // 0-100
  hoursThisWeek: number;
}

export interface DayHours {
  day: string;
  hours: number;
}

export interface PeriodProgress {
  label: string;
  progress: number; // 0-100
}

interface LearningStoreState {
  tracks: LearningTrack[];
  dailyStudyHours: DayHours[];
  weeklyProgress: PeriodProgress[];
  monthlyProgress: PeriodProgress[];
}

let store: LearningStoreState = {
  tracks: [
    { id: "courses", label: "Courses", progress: 64, hoursThisWeek: 3.5 },
    { id: "certificates", label: "Certificates", progress: 40, hoursThisWeek: 1 },
    { id: "coding", label: "Coding", progress: 72, hoursThisWeek: 5 },
    { id: "aptitude", label: "Aptitude", progress: 54, hoursThisWeek: 2 },
    { id: "english", label: "English", progress: 80, hoursThisWeek: 1.5 },
    { id: "logical-reasoning", label: "Logical Reasoning", progress: 48, hoursThisWeek: 1 },
  ],
  dailyStudyHours: [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 2 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 3.5 },
  ],
  weeklyProgress: [
    { label: "W1", progress: 38 },
    { label: "W2", progress: 45 },
    { label: "W3", progress: 51 },
    { label: "W4", progress: 58 },
  ],
  monthlyProgress: [
    { label: "May", progress: 22 },
    { label: "Jun", progress: 41 },
    { label: "Jul", progress: 55 },
    { label: "Aug", progress: 58 },
  ],
};

const listeners: Set<(state: LearningStoreState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(store));
}

export const learningStore = {
  getState: (): LearningStoreState => store,

  getWeakestTrack: (): LearningTrack => {
    return [...store.tracks].sort((a, b) => a.progress - b.progress)[0];
  },

  // Logs a short study session against a track -- small, real interaction
  // rather than a purely static display (matches Module 5's "Mark as
  // Applied" pattern).
  logSession: (trackId: string, minutes: number): LearningTrack | undefined => {
    let changed: LearningTrack | undefined;
    store = {
      ...store,
      tracks: store.tracks.map((t) => {
        if (t.id !== trackId) return t;
        changed = {
          ...t,
          progress: Math.min(100, t.progress + Math.round(minutes / 6)),
          hoursThisWeek: Math.round((t.hoursThisWeek + minutes / 60) * 10) / 10,
        };
        return changed;
      }),
    };
    notifyListeners();
    return changed;
  },

  subscribe: (listener: (state: LearningStoreState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
