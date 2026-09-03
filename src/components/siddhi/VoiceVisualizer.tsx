/**
 * MODULE 3: VOICE VISUALIZER COMPONENT
 * 
 * Animated bars showing voice activity (speaking/listening).
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  isListening = false,
  isSpeaking = false,
}) => {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.3));

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBars(
        Array(12)
          .fill(0)
          .map(() => {
            const base = isListening ? 0.4 : 0.2;
            const variance = isListening ? 0.6 : 0.5;
            return base + Math.random() * variance;
          })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isListening]);

  const containerColor = isListening
    ? 'from-blue-400 to-cyan-400'
    : isSpeaking
      ? 'from-green-400 to-emerald-400'
      : 'from-purple-400 to-pink-400';

  return (
    <motion.div
      className={`flex items-center justify-center gap-1 p-4 rounded-lg bg-gradient-to-r ${containerColor} bg-opacity-10`}
      animate={{ opacity: isActive ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
    >
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full bg-gradient-to-t ${containerColor}`}
          animate={{ height: `${20 + height * 20}px` }}
          transition={{
            duration: 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
};
