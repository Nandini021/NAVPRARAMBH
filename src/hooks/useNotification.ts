/**
 * MODULE 8: useNotification Hook
 */

import { useCallback } from 'react';
import { notificationStore } from '../store/notificationStore';
import type { NotificationType } from '../store/notificationStore';

export function useNotification() {
  const notify = useCallback(
    (type: NotificationType, title: string, message: string, options?: {
      siddhiMessage?: string;
      actionUrl?: string;
      actionLabel?: string;
      duration?: number;
    }) => {
      return notificationStore.notify(type, title, message, options);
    },
    []
  );

  const success = useCallback(
    (title: string, message: string, siddhiMessage?: string) => {
      notify('success', title, message, { siddhiMessage, duration: 3000 });
    },
    [notify]
  );

  const warning = useCallback(
    (title: string, message: string, siddhiMessage?: string) => {
      notify('warning', title, message, { siddhiMessage, duration: 5000 });
    },
    [notify]
  );

  const achievement = useCallback(
    (title: string, message: string, siddhiMessage?: string) => {
      notify('achievement', title, message, { siddhiMessage, duration: 5000 });
    },
    [notify]
  );

  const internshipAlert = useCallback(
    (company: string, role: string) => {
      notify('internship-alert', `${company} is hiring`, `${role} position opened`, {
        siddhiMessage: `Great opportunity! ${company} is looking for ${role}s. Should we apply?`,
        actionUrl: '/jobs',
        actionLabel: 'Check it out',
        duration: 6000,
      });
    },
    [notify]
  );

  const interviewAlert = useCallback(
    (company: string) => {
      notify('interview-alert', `Interview Scheduled`, `${company} wants to interview you!`, {
        siddhiMessage: `Exciting! ${company} has invited you for an interview. Let's prepare!`,
        actionUrl: '/placement-prep',
        actionLabel: 'Prep Now',
        duration: 6000,
      });
    },
    [notify]
  );

  return {
    notify,
    success,
    warning,
    achievement,
    internshipAlert,
    interviewAlert,
  };
}
