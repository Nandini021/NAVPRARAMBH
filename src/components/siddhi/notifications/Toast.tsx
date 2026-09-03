/**
 * MODULE 8: Toast Notification Component
 * 
 * Animated toast that slides in with SIDDHI personality.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Notification } from '../../../store/notificationStore';

interface ToastNotificationProps {
  notification: Notification;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const [showSiddhiMessage, setShowSiddhiMessage] = useState(false);

  useEffect(() => {
    if (notification.siddhiMessage) {
      const timer = setTimeout(() => {
        setShowSiddhiMessage(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [notification.siddhiMessage]);

  const typeConfig = {
    success: { bg: 'bg-green-500', icon: '✓' },
    warning: { bg: 'bg-amber-500', icon: '⚠' },
    reminder: { bg: 'bg-blue-500', icon: '🔔' },
    achievement: { bg: 'bg-purple-500', icon: '🏆' },
    'job-alert': { bg: 'bg-sky-500', icon: '💼' },
    'learning-reminder': { bg: 'bg-blue-500', icon: '📚' },
    message: { bg: 'bg-indigo-500', icon: '💬' },
    'internship-alert': { bg: 'bg-cyan-500', icon: '💼' },
    'interview-alert': { bg: 'bg-orange-500', icon: '📞' },
  };

  const config = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      className={`${config.bg} text-white rounded-lg shadow-2xl p-4 max-w-sm w-full`}
    >
      {/* With SIDDHI Message */}
      {notification.siddhiMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showSiddhiMessage ? 1 : 0, y: showSiddhiMessage ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="mb-3 p-3 bg-white/20 rounded-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium">💬 SIDDHI says:</p>
          <p className="text-sm mt-1">{notification.siddhiMessage}</p>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
          <p className="text-sm opacity-95 mt-1 line-clamp-2">{notification.message}</p>
          
          {notification.actionUrl && (
            <motion.a
              href={notification.actionUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block mt-2 text-xs font-semibold bg-white/30 hover:bg-white/40 px-3 py-1 rounded-full transition-colors"
            >
              {notification.actionLabel || 'View'}
            </motion.a>
          )}
        </div>
        
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
        >
          ✕
        </motion.button>
      </div>

      {/* Progress Bar */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="h-1 bg-white/30 mt-3 rounded-full overflow-hidden"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </motion.div>
  );
};
