/**
 * MODULE 8: Notification Container
 * 
 * Displays all active notifications.
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastNotification } from './Toast';
import { notificationStore } from '../../../store/notificationStore';
import type { Notification } from '../../../store/notificationStore';

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationStore.getActive()
  );

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(() => {
      setNotifications([...notificationStore.getActive()]);
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    notificationStore.dismiss(id);
    setNotifications([...notificationStore.getActive()]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
