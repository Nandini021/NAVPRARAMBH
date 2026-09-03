/**
 * MODULE 8: NOTIFICATION ENGINE
 * 
 * Smart notifications with SIDDHI personality.
 * Instead of boring notifications, SIDDHI delivers the news.
 */

export type NotificationType = 
  | 'success' 
  | 'warning' 
  | 'reminder' 
  | 'achievement' 
  | 'internship-alert' 
  | 'interview-alert'
  // Added for Module 9 (Notification Center) categories that had no
  // existing type: Job Alerts, Learning Reminders, Messages. Purely
  // additive -- every existing type above is unchanged.
  | 'job-alert'
  | 'learning-reminder'
  | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  siddhiMessage?: string; // Special message from SIDDHI personality
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  duration?: number; // milliseconds (0 = persistent)
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  history: Notification[];
  listeners: Set<(notification: Notification) => void>;
}

const store: NotificationStore = {
  notifications: [],
  history: [],
  listeners: new Set(),
};

// Module 9 addition: a second listener channel, separate from `listeners`
// above. `listeners` only fires on brand-new notifications (what the
// existing toast popup, NotificationContainer.tsx, needs). The Notification
// Center needs to re-render on read/dismiss/clear too, so it gets its own
// channel rather than changing what the toast listeners receive.
const changeListeners: Set<() => void> = new Set();

function notifyListeners(notification: Notification) {
  store.listeners.forEach(listener => listener(notification));
}

function notifyChangeListeners() {
  changeListeners.forEach(listener => listener());
}

export const notificationStore = {
  /**
   * Create and show notification
   */
  notify: (
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      siddhiMessage?: string;
      actionUrl?: string;
      actionLabel?: string;
      duration?: number;
    }
  ): Notification => {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      siddhiMessage: options?.siddhiMessage,
      actionUrl: options?.actionUrl,
      actionLabel: options?.actionLabel,
      duration: options?.duration ?? (type === 'achievement' ? 5000 : 4000),
      timestamp: new Date(),
      read: false,
    };

    store.notifications.push(notification);
    store.history.push(notification);

    // Keep only last 50 notifications in history
    if (store.history.length > 50) {
      store.history = store.history.slice(-50);
    }

    notifyListeners(notification);
    notifyChangeListeners();

    // Auto-remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        notificationStore.dismiss(notification.id);
      }, notification.duration);
    }

    return notification;
  },

  /**
   * Dismiss notification
   */
  dismiss: (notificationId: string) => {
    store.notifications = store.notifications.filter(n => n.id !== notificationId);
    notifyChangeListeners();
  },

  /**
   * Mark as read. Updates both the active toast list AND `history` --
   * previously this only updated `notifications`, which self-empties after
   * each notification's `duration` expires, so a notification could become
   * unreadable-as-read once its toast had disappeared. The Notification
   * Center (Module 9) reads from `history`, which persists, so both need
   * to agree on read state.
   */
  markAsRead: (notificationId: string) => {
    const active = store.notifications.find(n => n.id === notificationId);
    if (active) active.read = true;
    const past = store.history.find(n => n.id === notificationId);
    if (past) past.read = true;
    notifyChangeListeners();
  },

  /**
   * Mark every notification in history as read. Added for Module 9's
   * "mark all as read" action.
   */
  markAllAsRead: () => {
    store.history.forEach(n => { n.read = true; });
    store.notifications.forEach(n => { n.read = true; });
    notifyChangeListeners();
  },

  /**
   * Count of unread notifications in history. Added for Module 9's unread
   * badge (and reused by TopNav's bell, which previously had no real count
   * wired in).
   */
  getUnreadCount: (): number => store.history.filter(n => !n.read).length,

  /**
   * Clear all notifications
   */
  clearAll: () => {
    store.notifications = [];
    notifyChangeListeners();
  },

  /**
   * Get current notifications
   */
  getActive: (): Notification[] => [...store.notifications],

  /**
   * Get notification history
   */
  getHistory: (limit: number = 20): Notification[] => {
    return store.history.slice(-limit);
  },

  /**
   * Subscribe to new notifications
   */
  subscribe: (listener: (notification: Notification) => void) => {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },

  /**
   * Subscribe to ANY change (new, read, dismissed, cleared). Added for
   * Module 9's Notification Center and TopNav's unread badge, which both
   * need to re-render on more than just "new notification" -- unlike the
   * toast-only `subscribe` above, which stays exactly as it was.
   */
  subscribeToAll: (listener: () => void) => {
    changeListeners.add(listener);
    return () => { changeListeners.delete(listener); };
  },
};
