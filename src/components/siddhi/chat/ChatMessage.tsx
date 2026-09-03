/**
 * MODULE 2: CHAT MESSAGE COMPONENT
 * 
 * Individual chat message with markdown support and timestamp.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  emotion,
}) => {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        } shadow-md`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        {emotion && !isUser && (
          <p className="text-xs mt-1 text-gray-600">
            😊 {emotion}
          </p>
        )}
      </div>
    </motion.div>
  );
};
