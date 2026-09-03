/**
 * MODULE 6: useActivity Hook
 * 
 * Track current activity throughout the application.
 */

import { useEffect, useState, useCallback } from 'react';
import { activityTracker } from '../store/activityStore';
import type { Activity, ActivityType, CurrentTask } from '../store/activityStore';

export function useActivity() {
  const [activity, setActivity] = useState<Activity>(activityTracker.getCurrent());

  useEffect(() => {
    const unsubscribe = activityTracker.subscribe(setActivity);
    return unsubscribe;
  }, []);

  const setCurrentActivity = useCallback((type: ActivityType, task: CurrentTask, metadata?: Record<string, unknown>) => {
    activityTracker.setActivity(type, task, metadata);
  }, []);

  const updateActivity = useCallback((metadata: Record<string, unknown>) => {
    activityTracker.updateActivity(metadata);
  }, []);

  const getDuration = useCallback(() => {
    return activityTracker.getDuration();
  }, []);

  const isIdle = useCallback(() => {
    return activityTracker.isIdle();
  }, []);

  return {
    // Current state
    activityType: activity.type,
    currentTask: activity.task,
    metadata: activity.metadata,
    startTime: activity.startTime,
    // Actions
    setActivity: setCurrentActivity,
    updateActivity,
    getDuration,
    isIdle,
  };
}
