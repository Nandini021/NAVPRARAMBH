/**
 * MODULE 1: AVATAR COMPONENT
 * 
 * The living SIDDHI character.
 * 
 * Features:
 * - Blinks every 4-8 seconds
 * - Smiles while idle
 * - Waves on first page load
 * - Looks toward mouse pointer
 * - Different expressions for emotions
 * - Floating glow effect
 * - Responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEmotion } from '../../hooks/useEmotion';
import { getExpression } from './AvatarExpressions';
import './Avatar.css';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onFirstLoad?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = 'medium', 
  interactive = true,
  onFirstLoad 
}) => {
  const { emotion } = useEmotion();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeMap = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  };

  const expression = getExpression(emotion);

  // First load wave animation
  useEffect(() => {
    setTimeout(() => {
      setHasLoaded(true);
      if (onFirstLoad) onFirstLoad();
    }, 500);
  }, [onFirstLoad]);

  // Blinking animation (every 4-8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for eye following
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Clamp values between 0 and 1
      setMousePos({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Calculate eye rotation based on mouse position
  const eyeRotation = Math.atan2(mousePos.y - 0.5, mousePos.x - 0.5) * (180 / Math.PI);

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${sizeMap[size]} flex items-center justify-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-pink-300/20 blur-xl"
        animate={{
          opacity: expression.glowIntensity,
          scale: 1 + expression.glowIntensity * 0.2,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Main avatar container */}
      <motion.div
        className={`relative w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-200 overflow-hidden shadow-lg`}
        animate={{
          scale: expression.scale,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Avatar content */}
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Eyes container */}
          <div className="flex gap-4 mb-2 relative z-10">
            {/* Left eye */}
            <motion.div
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
              animate={{
                rotateX: isBlinking ? 90 : 0,
              }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="w-3 h-3 bg-blue-900 rounded-full"
                animate={{
                  rotate: interactive ? eyeRotation : 0,
                  translateX: mousePos.x - 0.5,
                  translateY: mousePos.y - 0.5,
                }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              />
            </motion.div>

            {/* Right eye */}
            <motion.div
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
              animate={{
                rotateX: isBlinking ? 90 : 0,
              }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="w-3 h-3 bg-blue-900 rounded-full"
                animate={{
                  rotate: interactive ? eyeRotation : 0,
                  translateX: mousePos.x - 0.5,
                  translateY: mousePos.y - 0.5,
                }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              />
            </motion.div>
          </div>

          {/* Eyebrows */}
          <div className="absolute top-12 left-8 right-8 flex justify-between px-2">
            <motion.div
              className="w-4 h-1 bg-blue-900 rounded-full"
              animate={{
                rotate: expression.eyebrowAngle,
                scaleX: 1.2,
              }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              className="w-4 h-1 bg-blue-900 rounded-full"
              animate={{
                rotate: -expression.eyebrowAngle,
                scaleX: 1.2,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Mouth */}
          <div className="mt-4">
            {expression.mouthState === 'smile' && (
              <motion.svg
                width="32"
                height="16"
                viewBox="0 0 32 16"
                animate={{
                  scale: 1.1,
                }}
              >
                <path
                  d="M 4 8 Q 16 14 28 8"
                  stroke="#333"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}

            {expression.mouthState === 'neutral' && (
              <motion.svg width="24" height="4" viewBox="0 0 24 4">
                <line x1="2" y1="2" x2="22" y2="2" stroke="#333" strokeWidth="2" />
              </motion.svg>
            )}

            {expression.mouthState === 'frown' && (
              <motion.svg width="32" height="16" viewBox="0 0 32 16">
                <path
                  d="M 4 8 Q 16 2 28 8"
                  stroke="#333"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}

            {expression.mouthState === 'surprised' && (
              <motion.div
                className="w-4 h-5 rounded-full bg-gray-800"
                animate={{ scaleY: 1.2 }}
              />
            )}

            {expression.mouthState === 'thinking' && (
              <motion.svg width="28" height="20" viewBox="0 0 28 20">
                <circle cx="8" cy="15" r="2" fill="#333" />
                <circle cx="14" cy="18" r="2.5" fill="#333" />
                <circle cx="20" cy="16" r="2" fill="#333" />
              </motion.svg>
            )}
          </div>
        </div>

        {/* Wave animation (on first load) */}
        {hasLoaded && (
          <motion.div
            className="absolute top-4 right-6 w-6 h-6 text-yellow-400 text-xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 30, -30, 0] }}
              transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
            >
              👋
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Animation class based on expression */}
      {expression.animation && (
        <style>{`
          @keyframes breath {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes jump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes nod {
            0%, 100% { transform: rotateX(0); }
            25% { transform: rotateX(10deg); }
            75% { transform: rotateX(-10deg); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          
          @keyframes sleep {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
        `}</style>
      )}
    </motion.div>
  );
};
