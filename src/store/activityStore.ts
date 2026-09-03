/**
 * MODULE 6: ACTIVITY TRACKER
 * 
 * Tracks SIDDHI's context: what page, what activity, what task.
 * Enables context-aware responses.
 */

export type ActivityType = 
  | 'dashboard' 
  | 'career-explorer' 
  | 'jobs' 
  | 'internships' 
  | 'courses' 
  | 'certifications' 
  | 'placement-prep' 
  | 'games' 
  | 'interview' 
  | 'resume' 
  | 'profile' 
  | 'idle';

export type CurrentTask =
  | 'browsing'
  | 'reading'
  | 'quiz'
  | 'game'
  | 'interview'
  | 'resume-review'
  | 'course-learning'
  | 'job-searching'
  | 'career-planning'
  | 'idle';

export interface Activity {
  type: ActivityType;
  task: CurrentTask;
  metadata: Record<string, unknown>;
  startTime: Date;
  lastUpdate: Date;
}

export interface ActivityStore {
  current: Activity;
  history: Activity[];
  listeners: Set<(activity: Activity) => void>;
}

const defaultActivity: Activity = {
  type: 'idle',
  task: 'idle',
  metadata: {},
  startTime: new Date(),
  lastUpdate: new Date(),
};

const activityStore: ActivityStore = {
  current: { ...defaultActivity },
  history: [],
  listeners: new Set(),
};

function notifyListeners() {
  activityStore.listeners.forEach(listener => listener(activityStore.current));
}

export const activityTracker = {
  // Get current activity
  getCurrent: (): Activity => ({ ...activityStore.current }),

  // Set activity
  setActivity: (type: ActivityType, task: CurrentTask, metadata?: Record<string, unknown>) => {
    // Save previous activity to history
    activityStore.history.push({ ...activityStore.current });
    if (activityStore.history.length > 50) {
      activityStore.history = activityStore.history.slice(-50);
    }

    // Set new activity
    activityStore.current = {
      type,
      task,
      metadata: metadata || {},
      startTime: new Date(),
      lastUpdate: new Date(),
    };

    notifyListeners();
  },

  // Update current activity metadata
  updateActivity: (metadata: Record<string, unknown>) => {
    activityStore.current.metadata = {
      ...activityStore.current.metadata,
      ...metadata,
    };
    activityStore.current.lastUpdate = new Date();
    notifyListeners();
  },

  // Get activity duration in seconds
  getDuration: (): number => {
    return Math.floor((Date.now() - activityStore.current.startTime.getTime()) / 1000);
  },

  // Subscribe to activity changes
  subscribe: (listener: (activity: Activity) => void) => {
    activityStore.listeners.add(listener);
    return () => {
      activityStore.listeners.delete(listener);
    };
  },

  // Get history
  getHistory: (limit: number = 20) => {
    return activityStore.history.slice(-limit);
  },

  // Check if user is idle (no activity change for 5 minutes)
  isIdle: (): boolean => {
    const durationMinutes = activityTracker.getDuration() / 60;
    return durationMinutes > 5 || activityStore.current.task === 'idle';
  },
};

