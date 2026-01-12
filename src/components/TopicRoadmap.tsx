'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TopicAnalysis, WeekPlan, DangerZone } from '@/types';

interface TopicRoadmapProps {
  weekByWeek: WeekPlan[];
  topicAnalysis: TopicAnalysis[];
  dangerZones: DangerZone[];
  isPreview?: boolean;
}

// Extracted to module level to prevent recreation on every render
const NODE_STYLES = {
  final: {
    node: 'bg-rose-900 border-rose-600 shadow-rose-900/50',
    text: 'text-rose-100 font-bold',
    badge: 'bg-rose-900/50 text-rose-200 border-rose-700',
    glow: 'shadow-lg shadow-rose-900/30',
  },
  midterm: {
    node: 'bg-red-600 border-red-400 shadow-red-600/50',
    text: 'text-red-100 font-semibold',
    badge: 'bg-red-500/20 text-red-300 border-red-500/50',
    glow: 'shadow-lg shadow-red-500/20',
  },
  break: {
    node: 'bg-gray-700 border-gray-500',
    text: 'text-gray-300 italic',
    badge: 'bg-gray-700/50 text-gray-400 border-gray-600',
    glow: '',
  },
  normal: {
    node: 'bg-white/10 border-white/20',
    text: 'text-gray-200',
    badge: 'bg-white/5 text-gray-400 border-white/10',
    glow: '',
  },
} as const;

export default function TopicRoadmap({ weekByWeek, topicAnalysis, dangerZones, isPreview = false }: TopicRoadmapProps) {
  const PREVIEW_LIMIT = 4; // Show first 4 weeks in preview
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  // Handle missing/undefined data gracefully
  const weeks = weekByWeek || [];
  const analysis = topicAnalysis || [];
  const dangers = dangerZones || [];

  // Early return if no data
  if (weeks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No weekly schedule available</p>
      </div>
    );
  }

  const getAnalysis = (week: number) => analysis.find(t => t.week === week);
  const isDangerZone = (week: number) => dangers.some(dz => dz.weeks?.includes(week));
  const getDangerZoneInfo = (week: number) => dangers.find(dz => dz.weeks?.includes(week));

  const getWeekType = (weekPlan: WeekPlan): 'normal' | 'midterm' | 'final' | 'break' => {
    const text = [...weekPlan.topics, ...weekPlan.assignments].join(' ').toLowerCase();
    if (text.includes('final')) return 'final';
    if (text.includes('midterm') || text.includes('exam')) return 'midterm';
    if (text.includes('break') || text.includes('holiday') || weekPlan.topics.length === 0) return 'break';
    return 'normal';
  };

  const getMainTopic = (weekPlan: WeekPlan): string => {
    const type = getWeekType(weekPlan);
    if (type === 'final') return 'FINAL EXAM';
    if (type === 'midterm') {
      const examTopic = weekPlan.topics.find(t => t.toLowerCase().includes('midterm') || t.toLowerCase().includes('exam'));
      return examTopic || 'MIDTERM';
    }
    if (type === 'break') return 'SPRING BREAK';
    return weekPlan.topics[0] || `Week ${weekPlan.week}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-1">Semester Journey</h3>
        <p className="text-sm text-gray-500">Your path from day one to final exam</p>
      </div>

      {/* Vertical Roadmap */}
      <div className="relative pl-2">
        {/* Weeks */}
        <div className="space-y-0">
          {weeks.slice(0, isPreview ? PREVIEW_LIMIT : undefined).map((weekPlan, idx) => {
            const weekType = getWeekType(weekPlan);
            const mainTopic = getMainTopic(weekPlan);
            const inDangerZone = isDangerZone(weekPlan.week);
            const analysis = getAnalysis(weekPlan.week);
            const isExpanded = expandedWeek === weekPlan.week;
            const dangerInfo = getDangerZoneInfo(weekPlan.week);

            const styles = NODE_STYLES[weekType];

            const isLastVisible = isPreview
              ? idx === Math.min(PREVIEW_LIMIT, weeks.length) - 1
              : idx === weeks.length - 1;

            return (
              <motion.div
                key={weekPlan.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="relative"
              >
                {/* Node + Content Row */}
                <div
                  className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.02] ${
                    isExpanded ? 'bg-white/[0.03]' : ''
                  }`}
                  onClick={() => setExpandedWeek(isExpanded ? null : weekPlan.week)}
                >
                  {/* Node Column with Line */}
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    {/* Connector line above (except first) */}
                    {idx > 0 && (
                      <div className={`absolute -top-3 w-0.5 h-3 ${
                        inDangerZone ? 'bg-amber-500/60' : 'bg-indigo-500/40'
                      }`} />
                    )}

                    {/* Node Circle */}
                    <div className="relative z-10">
                      {/* Danger Zone Pulse */}
                      {inDangerZone && weekType === 'normal' && (
                        <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
                      )}
                      <div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold
                          ${styles.node} ${styles.glow}
                          ${inDangerZone && weekType === 'normal' ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
                        `}
                      >
                        {weekType === 'final' ? '💀' : weekType === 'midterm' ? '📝' : weekType === 'break' ? '☀️' : weekPlan.week}
                      </div>
                    </div>

                    {/* Connector line below (except last visible) */}
                    {!isLastVisible && (
                      <div className={`w-0.5 flex-1 min-h-[2rem] ${
                        inDangerZone || isDangerZone(weeks[idx + 1]?.week)
                          ? 'bg-amber-500/60'
                          : 'bg-indigo-500/40'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    {/* Week Label + Topic */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {weekType === 'break' ? '' : `Week ${weekPlan.week}`}
                          {weekPlan.dates && <span className="ml-2 normal-case">{weekPlan.dates}</span>}
                        </span>
                        <h4 className={`text-base leading-tight mt-0.5 ${styles.text}`}>
                          {mainTopic}
                        </h4>

                        {/* Sub-topics for normal weeks */}
                        {weekType === 'normal' && weekPlan.topics.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            + {weekPlan.topics.slice(1).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {analysis && weekType === 'normal' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${styles.badge}`}>
                            {analysis.hoursToMaster}h
                          </span>
                        )}
                        {inDangerZone && weekType !== 'midterm' && weekType !== 'final' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ⚠ danger
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assignments Preview */}
                    {weekType === 'normal' && weekPlan.assignments.length > 0 && !isExpanded && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {weekPlan.assignments.slice(0, 2).map((a, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {a.length > 25 ? a.slice(0, 25) + '...' : a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand Arrow */}
                  <div className="flex-shrink-0 pt-2">
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-[4.5rem] mr-4 mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                        {/* Topics */}
                        {weekPlan.topics.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Topics</h5>
                            <div className="flex flex-wrap gap-2">
                              {weekPlan.topics.map((topic, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg text-sm bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Concepts */}
                        {analysis?.conceptsYouMustKnow && analysis.conceptsYouMustKnow.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Must Know</h5>
                            <ul className="space-y-1">
                              {analysis.conceptsYouMustKnow.map((c, i) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">✓</span>
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Assignments */}
                        {weekPlan.assignments.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Due This Week</h5>
                            <ul className="space-y-1">
                              {weekPlan.assignments.map((a, i) => (
                                <li key={i} className="text-sm text-orange-300 flex items-start gap-2">
                                  <span>📌</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Danger Zone Warning */}
                        {dangerInfo && (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm text-amber-300 font-medium">{dangerInfo.warning}</p>
                            <p className="text-xs text-gray-400 mt-1">{dangerInfo.reason}</p>
                            <p className="text-xs text-emerald-400 mt-2">💡 {dangerInfo.prevention}</p>
                          </div>
                        )}

                        {/* Study Tip */}
                        {weekPlan.studyTips && (
                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-sm text-emerald-300">💡 {weekPlan.studyTips}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Locked Preview Section */}
        {isPreview && weeks.length > PREVIEW_LIMIT && (
          <div className="relative mt-2">
            {/* Blurred locked weeks indicator */}
            <div className="relative rounded-2xl overflow-hidden">
              {/* Blur overlay */}
              <div className="absolute inset-0 backdrop-blur-md bg-[#0a0a0f]/80 z-10" />

              {/* Faded content behind */}
              <div className="opacity-30 space-y-1 p-4">
                {weeks.slice(PREVIEW_LIMIT, PREVIEW_LIMIT + 3).map((weekPlan) => (
                  <div key={weekPlan.week} className="flex items-center gap-4 p-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Locked message */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-gray-300 font-medium">+{weeks.length - PREVIEW_LIMIT} more weeks</p>
                <p className="text-gray-500 text-sm">Including midterms & final exam</p>
              </div>
            </div>
          </div>
        )}

        {/* Final Destination */}
        {!isPreview && (
          <div className="relative mt-6 ml-[4.5rem] p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="font-semibold text-emerald-300">Course Complete</p>
                <p className="text-sm text-gray-400">You&apos;ve conquered {weeks.length} weeks</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
