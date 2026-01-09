'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingStateProps {
  stage: number;
}

const stages = [
  {
    label: 'Extracting course info',
    emoji: '📋',
    description: 'Reading syllabus structure and key details',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Analyzing topics & difficulty',
    emoji: '🔍',
    description: 'Understanding what you\'ll learn and what\'s challenging',
    color: 'from-violet-500 to-purple-500'
  },
  {
    label: 'Generating practice materials',
    emoji: '📝',
    description: 'Creating flashcards and study questions',
    color: 'from-amber-500 to-orange-500'
  },
  {
    label: 'Creating your battle plan',
    emoji: '⚔️',
    description: 'Building week-by-week strategy to ace this class',
    color: 'from-emerald-500 to-teal-500'
  },
];

const tips = [
  "Pro tip: Start studying 2-3 days before exams, not the night before",
  "Studies show: Spaced repetition boosts retention by 200%",
  "Fun fact: Your brain consolidates learning during sleep",
  "Remember: Active recall beats passive re-reading every time",
  "Strategy: Break study sessions into 25-minute focused blocks",
];

export default function LoadingState({ stage }: LoadingStateProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);

    const dotInterval = setInterval(() => {
      setDots((prev) => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(tipInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const progress = ((stage + 1) / stages.length) * 100;
  const currentStage = stages[stage] || stages[0];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto text-center px-6">
        {/* Main animated icon */}
        <motion.div
          key={stage}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          {/* Outer ring */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ strokeDasharray: '364.4', strokeDashoffset: '0' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center emoji */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center text-5xl"
            >
              {currentStage.emoji}
            </motion.div>
          </div>
        </motion.div>

        {/* Stage info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2">
              {currentStage.label}{dots}
            </h2>
            <p className="text-gray-400">{currentStage.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress steps */}
        <div className="flex justify-center gap-3 mb-8">
          {stages.map((s, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{
                scale: i === stage ? 1.1 : 1,
                opacity: i <= stage ? 1 : 0.3
              }}
              className={`relative`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                i < stage
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : i === stage
                    ? `bg-gradient-to-br ${currentStage.color} text-white shadow-lg`
                    : 'bg-white/5 text-gray-600'
              }`}>
                {i < stage ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <span className="text-lg">{s.emoji}</span>
                )}
              </div>

              {/* Connecting line */}
              {i < stages.length - 1 && (
                <div className={`absolute top-1/2 left-full w-3 h-0.5 -translate-y-1/2 ${
                  i < stage ? 'bg-emerald-500/50' : 'bg-white/10'
                }`} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Step {stage + 1} of {stages.length}</p>
        </div>

        {/* Rotating tips */}
        <div className="glass rounded-2xl p-4 max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-gray-400"
            >
              <span className="text-indigo-400">💡</span> {tips[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Time estimate */}
        <p className="text-gray-600 mt-6 text-sm">
          Usually takes about 60-90 seconds
        </p>
      </div>
    </div>
  );
}
