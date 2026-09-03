/**
 * MODULE 2: TYPING INDICATOR
 * 
 * Shows that SIDDHI is typing a response.
 */

import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-1 p-4"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          className="w-2 h-2 bg-blue-500 rounded-full"
        />
      ))}
    </motion.div>
  );
};
