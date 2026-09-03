/**
 * MODULE 1: AVATAR EXPRESSIONS
 * 
 * Maps emotions to visual states and animations.
 * No anime - uses geometric shapes and CSS animations.
 */

import type { Emotion } from '../../store/emotionStore';

export interface AvatarExpression {
  name: Emotion;
  eyeState: 'open' | 'closed' | 'squinting';
  mouthState: 'neutral' | 'smile' | 'frown' | 'surprised' | 'thinking';
  eyebrowAngle: number; // -20 to 20 degrees
  glowIntensity: number; // 0 to 1
  scale: number; // 0.9 to 1.1
  animation?: string;
}

export const expressionMap: Record<Emotion, AvatarExpression> = {
  idle: {
    name: 'idle',
    eyeState: 'open',
    mouthState: 'smile',
    eyebrowAngle: 0,
    glowIntensity: 0.6,
    scale: 1,
    animation: 'breath',
  },
  happy: {
    name: 'happy',
    eyeState: 'squinting',
    mouthState: 'smile',
    eyebrowAngle: 15,
    glowIntensity: 0.9,
    scale: 1.05,
    animation: 'bounce',
  },
  thinking: {
    name: 'thinking',
    eyeState: 'open',
    mouthState: 'thinking',
    eyebrowAngle: -15,
    glowIntensity: 0.7,
    scale: 1,
    animation: 'pulse',
  },
  typing: {
    name: 'typing',
    eyeState: 'open',
    mouthState: 'neutral',
    eyebrowAngle: 0,
    glowIntensity: 0.8,
    scale: 1.02,
    animation: 'none',
  },
  listening: {
    name: 'listening',
    eyeState: 'open',
    mouthState: 'surprised',
    eyebrowAngle: 10,
    glowIntensity: 1,
    scale: 1.03,
    animation: 'pulse',
  },
  celebrating: {
    name: 'celebrating',
    eyeState: 'squinting',
    mouthState: 'smile',
    eyebrowAngle: 20,
    glowIntensity: 1,
    scale: 1.1,
    animation: 'jump',
  },
  focused: {
    name: 'focused',
    eyeState: 'open',
    mouthState: 'neutral',
    eyebrowAngle: -20,
    glowIntensity: 0.8,
    scale: 0.98,
    animation: 'pulse-slow',
  },
  concerned: {
    name: 'concerned',
    eyeState: 'open',
    mouthState: 'frown',
    eyebrowAngle: -15,
    glowIntensity: 0.5,
    scale: 0.97,
    animation: 'shake',
  },
  motivating: {
    name: 'motivating',
    eyeState: 'open',
    mouthState: 'smile',
    eyebrowAngle: 10,
    glowIntensity: 0.85,
    scale: 1.04,
    animation: 'nod',
  },
  sleep: {
    name: 'sleep',
    eyeState: 'closed',
    mouthState: 'neutral',
    eyebrowAngle: 0,
    glowIntensity: 0.2,
    scale: 1,
    animation: 'sleep',
  },
};

export function getExpression(emotion: Emotion): AvatarExpression {
  return expressionMap[emotion] || expressionMap.idle;
}
