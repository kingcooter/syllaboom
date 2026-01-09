'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarEvent, KeyDate } from '@/types';

interface CalendarViewProps {
  events: CalendarEvent[];
  keyDates: KeyDate[];
  semester: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const eventColors: Record<string, { bg: string; border: string; text: string }> = {
  exam: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  assignment: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  deadline: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  study: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  class: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-400' },
  milestone: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
};

export default function CalendarView({ events, keyDates, semester }: CalendarViewProps) {
  const [hoveredEvents, setHoveredEvents] = useState<{ events: (CalendarEvent | KeyDate)[]; x: number; y: number } | null>(null);

  // Determine semester months (Spring: Jan-May, Fall: Aug-Dec)
  const semesterMonths = useMemo(() => {
    const isSpring = semester.toLowerCase().includes('spring');
    const isFall = semester.toLowerCase().includes('fall');
    const isSummer = semester.toLowerCase().includes('summer');

    // Extract year from semester string
    const yearMatch = semester.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    if (isSpring) return [0, 1, 2, 3, 4].map(m => ({ month: m, year })); // Jan-May
    if (isFall) return [7, 8, 9, 10, 11].map(m => ({ month: m, year })); // Aug-Dec
    if (isSummer) return [4, 5, 6, 7].map(m => ({ month: m, year })); // May-Aug
    return [0, 1, 2, 3, 4].map(m => ({ month: m, year })); // Default to spring
  }, [semester]);

  // Combine events and key dates
  const allEvents = useMemo(() => {
    const combined: (CalendarEvent | KeyDate)[] = [...events];

    keyDates.forEach(kd => {
      // Check if already exists in events
      const exists = events.some(e => e.date === kd.date && e.title === kd.event);
      if (!exists) {
        combined.push(kd);
      }
    });

    return combined;
  }, [events, keyDates]);

  // Get events for a specific date
  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  // Generate calendar grid for a month
  const generateMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Fill in empty days before first of month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Fill in days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill in remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const handleEventHover = (dayEvents: (CalendarEvent | KeyDate)[], e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvents({
      events: dayEvents,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleEventTouch = (dayEvents: (CalendarEvent | KeyDate)[], e: React.TouchEvent) => {
    e.preventDefault();
    handleEventHover(dayEvents, e);
  };

  const getEventTitle = (event: CalendarEvent | KeyDate) => {
    return 'title' in event ? event.title : event.event;
  };

  const getEventType = (event: CalendarEvent | KeyDate) => {
    return event.type || 'class';
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {Object.entries(eventColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
            <span className="text-xs text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterMonths.map(({ month, year }) => (
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] rounded-2xl border border-white/10 p-4"
          >
            {/* Month Header */}
            <h3 className="text-center font-semibold text-lg mb-3 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {MONTHS[month]} {year}
            </h3>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="space-y-1">
              {generateMonthGrid(year, month).map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIdx) => {
                    if (day === null) {
                      return <div key={dayIdx} className="h-10" />;
                    }

                    const dayEvents = getEventsForDate(year, month, day);
                    const hasExam = dayEvents.some(e => getEventType(e) === 'exam');
                    const hasDeadline = dayEvents.some(e => getEventType(e) === 'deadline' || getEventType(e) === 'assignment');
                    const hasStudy = dayEvents.some(e => getEventType(e) === 'study');
                    const hasClass = dayEvents.some(e => getEventType(e) === 'class');

                    return (
                      <div
                        key={dayIdx}
                        className={`relative h-10 rounded-lg flex flex-col items-center justify-center text-sm transition-all cursor-pointer
                          ${hasExam ? 'bg-red-500/20 border border-red-500/50 text-red-300 font-bold' :
                            hasDeadline ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300' :
                            hasStudy ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                            hasClass ? 'bg-violet-500/10 text-violet-300' :
                            'text-gray-400 hover:bg-white/5'
                          }
                        `}
                        onMouseEnter={(e) => dayEvents.length > 0 && handleEventHover(dayEvents, e)}
                        onMouseLeave={() => setHoveredEvents(null)}
                        onTouchStart={(e) => dayEvents.length > 0 && handleEventTouch(dayEvents, e)}
                        onTouchEnd={() => setTimeout(() => setHoveredEvents(null), 2000)}
                      >
                        <span>{day}</span>
                        {/* Event indicators */}
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1 h-1 rounded-full ${
                                  hasExam ? 'bg-red-400' :
                                  hasDeadline ? 'bg-orange-400' :
                                  hasStudy ? 'bg-emerald-400' :
                                  'bg-violet-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hover Tooltip - Shows all events on that day */}
      <AnimatePresence>
        {hoveredEvents && hoveredEvents.events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 px-4 py-3 bg-gray-900 border border-white/20 rounded-xl shadow-xl pointer-events-none max-w-xs"
            style={{
              left: hoveredEvents.x,
              top: hoveredEvents.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-xs text-gray-400 mb-2">{hoveredEvents.events[0].date}</div>
            <div className="space-y-2">
              {hoveredEvents.events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${eventColors[getEventType(event)]?.bg || 'bg-gray-500'} border ${eventColors[getEventType(event)]?.border || 'border-gray-500'}`} />
                  <div>
                    <div className={`font-medium text-sm ${eventColors[getEventType(event)]?.text || 'text-white'}`}>
                      {getEventTitle(event)}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{getEventType(event)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Key Dates</h3>
        <div className="grid gap-2 max-w-2xl mx-auto">
          {allEvents
            .filter(e => getEventType(e) === 'exam' || getEventType(e) === 'deadline' || getEventType(e) === 'assignment')
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 10)
            .map((event, idx) => {
              const colors = eventColors[getEventType(event)] || eventColors.class;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-xl ${colors.bg} border ${colors.border}`}
                >
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {new Date(event.date + 'T12:00:00').getDate()}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${colors.text}`}>{getEventTitle(event)}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {getEventType(event)}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
