/**
 * MODULE 2: CHAT PANEL COMPONENT
 * 
 * Main chat interface - combines avatar, messages, and input.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../Avatar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useEmotion } from '../../../hooks/useEmotion';
import { useMemory } from '../../../hooks/useMemory';

interface ChatPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen = true,
  onClose,
  onSendMessage,
}) => {
  const { emotion, startThinking } = useEmotion();
  const { messages, addMessage } = useMemory();
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage('user', content);

    // Start thinking animation
    startThinking();
    setIsLoading(true);

    // Get AI response
    if (onSendMessage) {
      try {
        const response = await onSendMessage(content);
        addMessage('ai', response, { emotion });
      } catch (error) {
        console.error('Failed to get response:', error);
        addMessage('ai', 'Sorry, I encountered an error. Please try again.');
      }
    }

    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full bg-white rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <Avatar size="small" interactive={false} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">SIDDHI AI</h3>
                <p className="text-xs text-gray-500">Always here to help</p>
              </div>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-24 h-24 mb-4">
                    <Avatar size="medium" interactive={false} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Hi! I'm SIDDHI
                  </h4>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Your AI career mentor. Ask me anything about interviews,
                    careers, or placement prep!
                  </p>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      emotion={typeof msg.metadata?.emotion === 'string' ? msg.metadata.emotion : undefined}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask SIDDHI anything..."
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
