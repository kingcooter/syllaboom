'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyGuide as StudyGuideType } from '@/types';
import CalendarView from './CalendarView';
import TopicRoadmap from './TopicRoadmap';

interface StudyGuideProps {
  guide: StudyGuideType;
  isPreview?: boolean;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'priority', label: 'Priority Intel', icon: '🎯' },
  { id: 'exams', label: 'Exams', icon: '📝' },
  { id: 'grades', label: 'Grades', icon: '📊' },
  { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
];

export default function StudyGuide({ guide, isPreview = false }: StudyGuideProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showConfetti, setShowConfetti] = useState(true);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [grades, setGrades] = useState<Record<string, number | null>>({});
  const [lastGradeMilestone, setLastGradeMilestone] = useState<string | null>(null);
  const [spreadsheetType, setSpreadsheetType] = useState<'excel' | 'sheets'>('sheets');
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Calculate weighted grade
  const calculatedGrade = useMemo(() => {
    let totalWeight = 0;
    let weightedSum = 0;
    let hasAnyGrade = false;

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item, i) => {
        const key = `${component.category}-${i}`;
        const grade = grades[key];
        if (grade !== null && grade !== undefined) {
          hasAnyGrade = true;
          weightedSum += (grade / 100) * item.weight;
          totalWeight += item.weight;
        }
      });
    });

    if (!hasAnyGrade || totalWeight === 0) return null;
    return (weightedSum / totalWeight) * 100;
  }, [grades, guide.gradingBreakdown]);

  // Check for grade milestone achievements
  useEffect(() => {
    if (calculatedGrade === null) return;

    let milestone = null;
    if (calculatedGrade >= 90 && lastGradeMilestone !== 'A') milestone = 'A';
    else if (calculatedGrade >= 80 && calculatedGrade < 90 && lastGradeMilestone !== 'B') milestone = 'B';
    else if (calculatedGrade >= 70 && calculatedGrade < 80 && lastGradeMilestone !== 'C') milestone = 'C';

    if (milestone && milestone !== lastGradeMilestone) {
      setLastGradeMilestone(milestone);
      // Trigger celebration for A grades
      if (milestone === 'A') {
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7'],
          });
        });
      }
    }
  }, [calculatedGrade, lastGradeMilestone]);

  const handleGradeChange = (key: string, value: string) => {
    const numValue = value === '' ? null : Math.min(100, Math.max(0, parseFloat(value) || 0));
    setGrades(prev => ({ ...prev, [key]: numValue }));
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-500';
    if (grade >= 90) return 'text-emerald-400';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-amber-400';
    if (grade >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeLetter = (grade: number | null) => {
    if (grade === null) return '--';
    if (grade >= 93) return 'A';
    if (grade >= 90) return 'A-';
    if (grade >= 87) return 'B+';
    if (grade >= 83) return 'B';
    if (grade >= 80) return 'B-';
    if (grade >= 77) return 'C+';
    if (grade >= 73) return 'C';
    if (grade >= 70) return 'C-';
    if (grade >= 67) return 'D+';
    if (grade >= 60) return 'D';
    return 'F';
  };

  // Calculate stats
  const stats = useMemo(() => {
    let deadlines = 0;
    let assignments = 0;

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item) => {
        assignments++;
        if (item.date) deadlines++;
      });
    });

    guide.examStrategy?.forEach((exam) => {
      if (exam.date) deadlines++;
    });

    const flashcardCount = guide.flashcardDeck?.length || 0;

    return { deadlines, assignments, flashcardCount };
  }, [guide]);

  useEffect(() => {
    if (showConfetti && !isPreview && typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti.default({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#6366f1', '#8b5cf6', '#a855f7', '#10b981']
          });
          confetti.default({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#6366f1', '#8b5cf6', '#a855f7', '#10b981']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      });
      setShowConfetti(false);
    }
  }, [showConfetti]);

  // Helper to escape ICS text fields (RFC 5545 compliant)
  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  // Generate DTSTAMP in UTC format (RFC 5545 requires this)
  const generateDTSTAMP = (): string => {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Get the next day for all-day event DTEND (RFC 5545: DTEND is exclusive)
  const getNextDay = (dateStr: string): string => {
    const date = new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const exportToCalendar = () => {
    const dtstamp = generateDTSTAMP();
    let icsContent = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Syllaboom//Study Guide//EN\r
CALSCALE:GREGORIAN\r
METHOD:PUBLISH\r
X-WR-CALNAME:${escapeICSText(guide.courseCode)} - ${escapeICSText(guide.courseName)}\r
`;

    if (guide.meetingSchedule || guide.meetingTimes) {
      const schedule = guide.meetingSchedule;
      const dayMap: Record<string, string> = {
        'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE',
        'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA', 'Sunday': 'SU',
        'Mon': 'MO', 'Tue': 'TU', 'Wed': 'WE', 'Thu': 'TH', 'Fri': 'FR',
        'M': 'MO', 'T': 'TU', 'W': 'WE', 'R': 'TH', 'F': 'FR'
      };

      let byDays: string[] = [];
      let startTime = '09:00';
      let endTime = '10:00';

      if (schedule?.days) {
        byDays = schedule.days.map(d => dayMap[d] || d.substring(0, 2).toUpperCase()).filter(Boolean);
        startTime = schedule.startTime || '09:00';
        endTime = schedule.endTime || '10:00';
      } else if (guide.meetingTimes) {
        const timeStr = guide.meetingTimes;
        if (timeStr.includes('M')) byDays.push('MO');
        if (timeStr.includes('T') && !timeStr.includes('Th')) byDays.push('TU');
        if (timeStr.includes('W')) byDays.push('WE');
        if (timeStr.includes('Th') || timeStr.includes('R')) byDays.push('TH');
        if (timeStr.includes('F')) byDays.push('FR');

        const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (timeMatch) {
          let startHour = parseInt(timeMatch[1]);
          const startMin = timeMatch[2] || '00';
          const startPeriod = timeMatch[3]?.toUpperCase();
          let endHour = parseInt(timeMatch[4]);
          const endMin = timeMatch[5] || '00';
          const endPeriod = (timeMatch[6] || timeMatch[3])?.toUpperCase();

          if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod === 'AM' && startHour === 12) startHour = 0;
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;

          startTime = `${startHour.toString().padStart(2, '0')}:${startMin}`;
          endTime = `${endHour.toString().padStart(2, '0')}:${endMin}`;
        }
      }

      if (byDays.length > 0) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7 || 7));

        const dateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
        const startTimeStr = startTime.replace(':', '') + '00';
        const endTimeStr = endTime.replace(':', '') + '00';
        const description = escapeICSText(`${guide.courseName}\nInstructor: ${guide.instructor}\nLocation: ${guide.location || 'TBD'}`);

        icsContent += `BEGIN:VEVENT\r
UID:class-${guide.courseCode}@syllaboom.com\r
DTSTAMP:${dtstamp}\r
SUMMARY:${escapeICSText(guide.courseCode)} - Class\r
DESCRIPTION:${description}\r
LOCATION:${escapeICSText(guide.location || '')}\r
DTSTART:${dateStr}T${startTimeStr}\r
DTEND:${dateStr}T${endTimeStr}\r
RRULE:FREQ=WEEKLY;BYDAY=${byDays.join(',')};COUNT=16\r
END:VEVENT\r
`;
      }
    }

    guide.examStrategy?.forEach((exam, index) => {
      if (exam.date) {
        const examDate = formatDateForICS(exam.date);
        const dateOnly = examDate.split('T')[0];
        const nextDay = getNextDay(dateOnly);
        const description = escapeICSText(`Weight: ${exam.weight}\nTopics: ${exam.coverage?.join(', ') || 'See syllabus'}`);

        icsContent += `BEGIN:VEVENT\r
UID:exam-${index}-${guide.courseCode}@syllaboom.com\r
DTSTAMP:${dtstamp}\r
SUMMARY:${escapeICSText(guide.courseCode)} - ${escapeICSText(exam.exam)}\r
DESCRIPTION:${description}\r
DTSTART;VALUE=DATE:${dateOnly}\r
DTEND;VALUE=DATE:${nextDay}\r
BEGIN:VALARM\r
TRIGGER:-P1D\r
ACTION:DISPLAY\r
DESCRIPTION:Exam tomorrow: ${escapeICSText(exam.exam)}\r
END:VALARM\r
BEGIN:VALARM\r
TRIGGER:-P3D\r
ACTION:DISPLAY\r
DESCRIPTION:Exam in 3 days: ${escapeICSText(exam.exam)}\r
END:VALARM\r
END:VEVENT\r
`;

        if (exam.studyPlan?.startDate) {
          const studyStart = formatDateForICS(exam.studyPlan.startDate);
          const studyDateOnly = studyStart.split('T')[0];
          const studyNextDay = getNextDay(studyDateOnly);
          icsContent += `BEGIN:VEVENT\r
UID:study-${index}-${guide.courseCode}@syllaboom.com\r
DTSTAMP:${dtstamp}\r
SUMMARY:Start studying for ${escapeICSText(exam.exam)}\r
DESCRIPTION:Begin exam prep for ${escapeICSText(exam.exam)}\r
DTSTART;VALUE=DATE:${studyDateOnly}\r
DTEND;VALUE=DATE:${studyNextDay}\r
END:VEVENT\r
`;
        }
      }
    });

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item, index) => {
        if (item.date) {
          const itemDate = formatDateForICS(item.date);
          const dateOnly = itemDate.split('T')[0];
          const nextDay = getNextDay(dateOnly);
          const description = escapeICSText(`Category: ${item.category || component.category}\nWeight: ${item.weight}%`);

          icsContent += `BEGIN:VEVENT\r
UID:assignment-${component.category}-${index}-${guide.courseCode}@syllaboom.com\r
DTSTAMP:${dtstamp}\r
SUMMARY:${escapeICSText(guide.courseCode)} - ${escapeICSText(item.name)} Due\r
DESCRIPTION:${description}\r
DTSTART;VALUE=DATE:${dateOnly}\r
DTEND;VALUE=DATE:${nextDay}\r
BEGIN:VALARM\r
TRIGGER:-P1D\r
ACTION:DISPLAY\r
DESCRIPTION:Due tomorrow: ${escapeICSText(item.name)}\r
END:VALARM\r
END:VEVENT\r
`;
        }
      });
    });

    icsContent += 'END:VCALENDAR\r\n';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.courseCode || 'course'}-schedule.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const rows: string[][] = [
      ['Category', 'Name', 'Weight (%)', 'Due Date', 'Grade', 'Letter Grade']
    ];

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item, i) => {
        const gradeKey = `${component.category}-${i}`;
        const grade = grades[gradeKey];
        rows.push([
          item.category || component.category,
          item.name,
          item.weight.toString(),
          item.date || '',
          grade !== null && grade !== undefined ? grade.toString() : '',
          grade !== null && grade !== undefined ? getGradeLetter(grade) : ''
        ]);
      });
    });

    // Add summary row if we have a calculated grade
    if (calculatedGrade !== null) {
      rows.push(['', '', '', '', '', '']);
      rows.push(['OVERALL', 'Weighted Average', '100', '', calculatedGrade.toFixed(1), getGradeLetter(calculatedGrade)]);
    }

    const csvContent = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.courseCode || 'course'}-assignments.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export grade calculator with spreadsheet formulas
  const exportToSpreadsheet = (type: 'excel' | 'sheets') => {
    const rows: string[][] = [];
    let rowNum = 2; // Start from row 2 (row 1 is header)
    const gradeRows: number[] = [];
    const weightRows: number[] = [];

    // Header row
    rows.push(['Category', 'Assignment', 'Weight (%)', 'Due Date', 'Grade (0-100)', 'Points Earned', 'Letter Grade']);

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item, i) => {
        const gradeKey = `${component.category}-${i}`;
        const grade = grades[gradeKey];
        const gradeCell = grade !== null && grade !== undefined ? grade.toString() : '';

        // Points earned formula: (Grade/100) * Weight
        const pointsFormula = type === 'sheets'
          ? `=IF(E${rowNum}="","",E${rowNum}/100*C${rowNum})`
          : `=IF(E${rowNum}="","",E${rowNum}/100*C${rowNum})`;

        // Letter grade formula
        const letterFormula = type === 'sheets'
          ? `=IF(E${rowNum}="","",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`
          : `=IF(E${rowNum}="","",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`;

        rows.push([
          component.category,
          item.name,
          item.weight.toString(),
          item.date || '',
          gradeCell,
          pointsFormula,
          letterFormula
        ]);

        gradeRows.push(rowNum);
        weightRows.push(rowNum);
        rowNum++;
      });
    });

    // Empty row
    rows.push(['', '', '', '', '', '', '']);
    rowNum++;

    // Summary section
    const totalWeightFormula = type === 'sheets'
      ? `=SUM(C2:C${rowNum - 2})`
      : `=SUM(C2:C${rowNum - 2})`;

    const earnedPointsFormula = type === 'sheets'
      ? `=SUM(F2:F${rowNum - 2})`
      : `=SUM(F2:F${rowNum - 2})`;

    // Weighted average formula (only counting filled grades)
    const weightedAvgFormula = type === 'sheets'
      ? `=IF(SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})=0,"--",SUMIF(E2:E${rowNum - 2},"<>",F2:F${rowNum - 2})/SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})*100)`
      : `=IF(SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})=0,"--",SUMIF(E2:E${rowNum - 2},"<>",F2:F${rowNum - 2})/SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})*100)`;

    const overallLetterFormula = type === 'sheets'
      ? `=IF(E${rowNum}="--","--",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`
      : `=IF(E${rowNum}="--","--",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`;

    rows.push(['SUMMARY', 'Overall Grade', totalWeightFormula, '', weightedAvgFormula, earnedPointsFormula, overallLetterFormula]);

    // Convert to TSV for easy paste into spreadsheets
    const tsvContent = rows.map(row => row.join('\t')).join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.courseCode || 'course'}-grades-${type}.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy grade table to clipboard for pasting into spreadsheets
  const copyGradeTable = async (type: 'excel' | 'sheets') => {
    const rows: string[][] = [];
    let rowNum = 2;

    rows.push(['Category', 'Assignment', 'Weight (%)', 'Due Date', 'Grade (0-100)', 'Points Earned', 'Letter Grade']);

    guide.gradingBreakdown?.components?.forEach((component) => {
      component.items?.forEach((item, i) => {
        const gradeKey = `${component.category}-${i}`;
        const grade = grades[gradeKey];
        const gradeCell = grade !== null && grade !== undefined ? grade.toString() : '';

        const pointsFormula = type === 'sheets'
          ? `=IF(E${rowNum}="","",E${rowNum}/100*C${rowNum})`
          : `=IF(E${rowNum}="","",E${rowNum}/100*C${rowNum})`;

        const letterFormula = type === 'sheets'
          ? `=IF(E${rowNum}="","",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`
          : `=IF(E${rowNum}="","",IF(E${rowNum}>=93,"A",IF(E${rowNum}>=90,"A-",IF(E${rowNum}>=87,"B+",IF(E${rowNum}>=83,"B",IF(E${rowNum}>=80,"B-",IF(E${rowNum}>=77,"C+",IF(E${rowNum}>=73,"C",IF(E${rowNum}>=70,"C-",IF(E${rowNum}>=67,"D+",IF(E${rowNum}>=60,"D","F")))))))))))`;

        rows.push([component.category, item.name, item.weight.toString(), item.date || '', gradeCell, pointsFormula, letterFormula]);
        rowNum++;
      });
    });

    rows.push(['', '', '', '', '', '', '']);
    rowNum++;

    const weightedAvgFormula = type === 'sheets'
      ? `=IF(SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})=0,"--",SUMIF(E2:E${rowNum - 2},"<>",F2:F${rowNum - 2})/SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})*100)`
      : `=IF(SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})=0,"--",SUMIF(E2:E${rowNum - 2},"<>",F2:F${rowNum - 2})/SUMIF(E2:E${rowNum - 2},"<>",C2:C${rowNum - 2})*100)`;

    rows.push(['SUMMARY', 'Overall Grade', `=SUM(C2:C${rowNum - 2})`, '', weightedAvgFormula, `=SUM(F2:F${rowNum - 2})`, '']);

    const tsvContent = rows.map(row => row.join('\t')).join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopySuccess('grades');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export course plan to Markdown
  const exportToMarkdown = () => {
    let md = `# ${guide.courseCode} - ${guide.courseName}\n\n`;
    md += `**Instructor:** ${guide.instructor || 'TBD'}\n`;
    md += `**Semester:** ${guide.semester || 'TBD'}\n`;
    if (guide.meetingTimes) md += `**Meeting Times:** ${guide.meetingTimes}\n`;
    if (guide.location) md += `**Location:** ${guide.location}\n`;
    md += '\n---\n\n';

    // Course Overview
    if (guide.courseOverview) {
      md += `## Course Overview\n\n`;
      if (guide.courseOverview.oneSentence) md += `${guide.courseOverview.oneSentence}\n\n`;
      if (guide.courseOverview.whyItMatters) md += `**Why It Matters:** ${guide.courseOverview.whyItMatters}\n\n`;
      if (guide.courseOverview.biggestChallenge) md += `**Biggest Challenge:** ${guide.courseOverview.biggestChallenge}\n\n`;
    }

    // Danger Zones
    if (guide.dangerZones && guide.dangerZones.length > 0) {
      md += `## ⚠️ Danger Zones\n\n`;
      guide.dangerZones.forEach(zone => {
        md += `- **Weeks ${zone.weeks.join('-')}:** ${zone.warning}\n`;
      });
      md += '\n';
    }

    // Week by Week Plan
    if (guide.weekByWeek && guide.weekByWeek.length > 0) {
      md += `## Week-by-Week Plan\n\n`;
      guide.weekByWeek.forEach(week => {
        md += `### Week ${week.week}`;
        if (week.dates) md += ` (${week.dates})`;
        md += `\n\n`;
        if (week.topics && week.topics.length > 0) {
          md += `**Topics:**\n`;
          week.topics.forEach(topic => md += `- ${topic}\n`);
          md += '\n';
        }
        if (week.readings && week.readings.length > 0) {
          md += `**Readings:**\n`;
          week.readings.forEach(r => md += `- ${r}\n`);
          md += '\n';
        }
        if (week.assignments && week.assignments.length > 0) {
          md += `**Assignments:**\n`;
          week.assignments.forEach(a => md += `- ${a}\n`);
          md += '\n';
        }
        if (week.studyTips) md += `**Study Tips:** ${week.studyTips}\n\n`;
      });
    }

    // Grading Breakdown
    if (guide.gradingBreakdown?.components && guide.gradingBreakdown.components.length > 0) {
      md += `## Grading Breakdown\n\n`;
      md += `| Category | Weight |\n|----------|--------|\n`;
      guide.gradingBreakdown.components.forEach(comp => {
        md += `| ${comp.category} | ${comp.totalWeight}% |\n`;
      });
      md += '\n';

      if (guide.gradingBreakdown.specialRules && guide.gradingBreakdown.specialRules.length > 0) {
        md += `**Special Rules:**\n`;
        guide.gradingBreakdown.specialRules.forEach(rule => md += `- ${rule}\n`);
        md += '\n';
      }
    }

    // Key Dates
    if (guide.keyDates && guide.keyDates.length > 0) {
      md += `## Key Dates\n\n`;
      md += `| Date | Event | Type |\n|------|-------|------|\n`;
      guide.keyDates.forEach(kd => {
        md += `| ${kd.date} | ${kd.event} | ${kd.type || ''} |\n`;
      });
      md += '\n';
    }

    // Exam Strategy
    if (guide.examStrategy && guide.examStrategy.length > 0) {
      md += `## Exam Strategy\n\n`;
      guide.examStrategy.forEach(exam => {
        md += `### ${exam.exam}\n`;
        md += `- **Date:** ${exam.date || 'TBD'}\n`;
        md += `- **Weight:** ${exam.weight}\n`;
        if (exam.coverage && exam.coverage.length > 0) {
          md += `- **Coverage:** ${exam.coverage.join(', ')}\n`;
        }
        if (exam.highYieldTopics && exam.highYieldTopics.length > 0) {
          md += `- **High-Yield Topics:**\n`;
          exam.highYieldTopics.forEach(t => md += `  - ${t}\n`);
        }
        md += '\n';
      });
    }

    // Time Commitment
    if (guide.semesterStrategy?.weeklyTimeCommitment) {
      const tc = guide.semesterStrategy.weeklyTimeCommitment;
      md += `## Weekly Time Commitment\n\n`;
      md += `- **Light Week:** ${tc.light} hours\n`;
      md += `- **Normal Week:** ${tc.normal} hours\n`;
      md += `- **Heavy Week:** ${tc.heavy} hours\n\n`;
    }

    md += `---\n\n*Generated by [Syllaboom](https://syllaboom.com)*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.courseCode || 'course'}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDateForICS = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMatch = dateStr.match(new RegExp(`(${monthNames.join('|')})\\w*\\s+(\\d{1,2})(?:,?\\s+(\\d{4}))?`, 'i'));
    if (monthMatch) {
      const month = monthNames.findIndex(m => monthMatch[1].toLowerCase().startsWith(m.toLowerCase())) + 1;
      const day = parseInt(monthMatch[2]);
      const year = monthMatch[3] ? parseInt(monthMatch[3]) : new Date().getFullYear();
      return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}T090000Z`;
    }

    // Fallback to a reasonable default date
    const now = new Date();
    return `${now.getFullYear()}0501T090000Z`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Preview Banner - Subtle Scandinavian design */}
      {isPreview && (
        <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 py-3 px-4">
          <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Preview: <span className="text-white font-medium">PSY 101</span> example guide</span>
            </div>
            <a
              href="/"
              className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Get yours
            </a>
          </div>
        </div>
      )}

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              isPreview
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isPreview ? 'Example Study Guide' : 'Study Guide Ready!'}
          </motion.div>
        </motion.div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-2xl font-bold text-indigo-400">{stats.deadlines}</span>
            <span className="text-gray-400 text-sm">deadlines tracked</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-2xl font-bold text-violet-400">{stats.flashcardCount}</span>
            <span className="text-gray-400 text-sm">flashcards ready</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-2xl font-bold text-emerald-400">{stats.assignments}</span>
            <span className="text-gray-400 text-sm">assignments in calculator</span>
          </div>
        </motion.div>

        {/* Course Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 mb-6 border border-white/5 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-indigo-400">{guide.courseCode}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-white">{guide.courseName}</span>
              </h1>
              <p className="text-gray-400 mb-2">{guide.instructor}</p>
              {guide.meetingTimes && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {guide.meetingTimes}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {guide.semesterStrategy?.weeklyTimeCommitment && (
                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-indigo-400 font-semibold">{guide.semesterStrategy.weeklyTimeCommitment.normal}h</span>
                  <span className="text-gray-500 text-sm">/week avg</span>
                </div>
              )}
            </div>
          </div>

          {guide.courseOverview?.oneSentence && (
            <p className="mt-4 text-gray-300 text-lg leading-relaxed">
              {guide.courseOverview.oneSentence}
            </p>
          )}
        </motion.div>

        {/* Danger Zones Alert */}
        <AnimatePresence>
          {guide.dangerZones && guide.dangerZones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass rounded-2xl p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ⚠️
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-red-400 mb-2">Danger Zones Detected</h3>
                    <div className="space-y-1">
                      {guide.dangerZones.map((zone, i) => (
                        <p key={i} className="text-sm text-gray-300">
                          <span className="text-red-400 font-medium">Weeks {zone.weeks.join('-')}:</span> {zone.warning}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const isLocked = isPreview && tab.id !== 'overview' && tab.id !== 'roadmap';
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isLocked && setActiveTab(tab.id)}
                  className={`relative px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : isLocked
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isLocked ? 'opacity-50' : ''}>{tab.icon}</span>
                  <span className={isLocked ? 'opacity-50' : ''}>{tab.label}</span>
                  {isLocked && <span className="text-xs ml-1">🔒</span>}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-3xl p-6 md:p-8 border border-white/5"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Why This Course Matters</h3>
                      <p className="text-gray-200 text-[15px] leading-relaxed">{guide.courseOverview?.whyItMatters}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Biggest Challenge</h3>
                      <p className="text-gray-200 text-[15px] leading-relaxed">{guide.courseOverview?.biggestChallenge}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Weekly Time Commitment</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Light', hours: guide.semesterStrategy?.weeklyTimeCommitment?.light || 6, color: 'emerald' },
                          { label: 'Normal', hours: guide.semesterStrategy?.weeklyTimeCommitment?.normal || 8, color: 'amber' },
                          { label: 'Heavy', hours: guide.semesterStrategy?.weeklyTimeCommitment?.heavy || 12, color: 'red' },
                        ].map((item) => (
                          <div key={item.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className={`text-3xl font-bold text-${item.color}-400`}>{item.hours}h</div>
                            <div className="text-xs text-gray-500 mt-1.5">{item.label} Week</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Path to an A</h3>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <p className="text-gray-200 text-[15px] leading-relaxed">{guide.semesterStrategy?.gradeTargetPaths?.A?.strategy}</p>
                        {guide.semesterStrategy?.gradeTargetPaths?.A?.riskLevel && (
                          <p className="text-sm text-emerald-400 mt-3 font-medium">
                            Risk: {guide.semesterStrategy.gradeTargetPaths.A.riskLevel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <div>
                {guide.weekByWeek && guide.weekByWeek.length > 0 ? (
                  <TopicRoadmap
                    weekByWeek={guide.weekByWeek}
                    topicAnalysis={guide.topicAnalysis || []}
                    dangerZones={guide.dangerZones || []}
                    isPreview={isPreview}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Course roadmap not available.</p>
                  </div>
                )}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div>
                {(guide.calendarEvents && guide.calendarEvents.length > 0) || (guide.keyDates && guide.keyDates.length > 0) ? (
                  <CalendarView
                    events={guide.calendarEvents || []}
                    keyDates={guide.keyDates || []}
                    semester={guide.semester}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Calendar events not available.</p>
                  </div>
                )}
              </div>
            )}

            {/* Priority Intel Tab */}
            {activeTab === 'priority' && (
              <div className="space-y-8">
                {!guide.priorityData ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Priority analysis not available for this course.</p>
                  </div>
                ) : (
                  <>
                    {/* Grade Paths */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>🎯</span> What You Need For Each Grade
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* A Path */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                          <div className="text-2xl font-bold text-emerald-400 mb-2">A</div>
                          <p className="text-sm text-gray-300 mb-3">{guide.priorityData.gradePaths?.A?.requiredMastery}</p>
                          <p className="text-xs text-gray-500 mb-2">{guide.priorityData.gradePaths?.A?.timePerWeek}</p>
                          {guide.priorityData.gradePaths?.A?.nonNegotiables && (
                            <div className="mt-3">
                              <p className="text-xs text-emerald-400 font-medium mb-1">Non-negotiables:</p>
                              <ul className="text-xs text-gray-400 space-y-1">
                                {guide.priorityData.gradePaths.A.nonNegotiables.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {/* B Path */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                          <div className="text-2xl font-bold text-blue-400 mb-2">B</div>
                          <p className="text-sm text-gray-300 mb-3">{guide.priorityData.gradePaths?.B?.requiredMastery}</p>
                          <p className="text-xs text-gray-500 mb-2">{guide.priorityData.gradePaths?.B?.timePerWeek}</p>
                          {guide.priorityData.gradePaths?.B?.recoveryRoom && (
                            <p className="text-xs text-blue-400 mt-3">💡 {guide.priorityData.gradePaths.B.recoveryRoom}</p>
                          )}
                        </div>
                        {/* C Path */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="text-2xl font-bold text-amber-400 mb-2">C</div>
                          <p className="text-sm text-gray-300 mb-3">{guide.priorityData.gradePaths?.C?.minimumViable}</p>
                          <p className="text-xs text-gray-500 mb-2">{guide.priorityData.gradePaths?.C?.timePerWeek}</p>
                          {guide.priorityData.gradePaths?.C?.survivalStrategy && (
                            <p className="text-xs text-amber-400 mt-3">🛟 {guide.priorityData.gradePaths.C.survivalStrategy}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Topic ROI */}
                    {guide.priorityData.topicPriority?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span>📊</span> Topic ROI Rankings
                        </h3>
                        <div className="space-y-2">
                          {guide.priorityData.topicPriority.map((topic, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                topic.roi === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' :
                                topic.roi === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {topic.roi}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{topic.topic}</div>
                                <div className="text-sm text-gray-500">Week {topic.week} • {topic.effortLevel} • {topic.examWeight}</div>
                              </div>
                              {topic.skipIfDesparate && (
                                <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-500/10">Can skip</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Must Know / Can Skip */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {guide.priorityData.mustKnowList?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>✅</span> Must Know
                          </h3>
                          <div className="space-y-2">
                            {guide.priorityData.mustKnowList.map((item, i) => (
                              <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-gray-200">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {guide.priorityData.canSkipList?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>⏭️</span> Can Skip If Short on Time
                          </h3>
                          <div className="space-y-2">
                            {guide.priorityData.canSkipList.map((item, i) => (
                              <div key={i} className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 text-sm text-gray-400">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cram Sheet */}
                    {guide.priorityData.cramSheet && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span>📝</span> Cram Sheet
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {guide.priorityData.cramSheet.formulas?.length > 0 && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <h4 className="text-sm font-medium text-indigo-400 mb-3">Key Formulas</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                {guide.priorityData.cramSheet.formulas.map((f, i) => (
                                  <li key={i} className="font-mono">{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {guide.priorityData.cramSheet.definitions?.length > 0 && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <h4 className="text-sm font-medium text-violet-400 mb-3">Must-Memorize Definitions</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                {guide.priorityData.cramSheet.definitions.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {guide.priorityData.cramSheet.concepts?.length > 0 && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <h4 className="text-sm font-medium text-emerald-400 mb-3">Core Concepts</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                {guide.priorityData.cramSheet.concepts.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {guide.priorityData.cramSheet.commonTricks?.length > 0 && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <h4 className="text-sm font-medium text-amber-400 mb-3">Common Trick Questions</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                {guide.priorityData.cramSheet.commonTricks.map((t, i) => (
                                  <li key={i}>⚠️ {t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exam Intel */}
                    {guide.priorityData.examIntel?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span>🔮</span> Exam Predictions & Tactics
                        </h3>
                        <div className="space-y-4">
                          {guide.priorityData.examIntel.map((exam, i) => (
                            <details key={i} className="group rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                              <summary className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                                <span className="font-semibold">{exam.exam}</span>
                                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="px-5 pb-5 space-y-4">
                                {/* Predicted Topics */}
                                {exam.predictedTopics?.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-2">Predicted Topics</h4>
                                    <div className="space-y-2">
                                      {exam.predictedTopics.map((t, j) => (
                                        <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                                          <span className="text-sm">{t.topic}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                              t.likelihood === 'Very Likely' ? 'bg-emerald-500/20 text-emerald-400' :
                                              t.likelihood === 'Likely' ? 'bg-amber-500/20 text-amber-400' :
                                              'bg-gray-500/20 text-gray-400'
                                            }`}>{t.likelihood}</span>
                                            <span className="text-xs text-gray-500">{t.pointsPrediction}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Time Strategy */}
                                {exam.timeStrategy && (
                                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <h4 className="text-sm font-medium text-indigo-400 mb-1">⏱️ Time Strategy ({exam.timeStrategy.totalMinutes} min)</h4>
                                    <p className="text-sm text-gray-300">{exam.timeStrategy.suggestedPacing}</p>
                                  </div>
                                )}

                                {/* Exam Day Checklist */}
                                <div className="grid md:grid-cols-3 gap-3">
                                  {exam.nightBefore?.length > 0 && (
                                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                      <h4 className="text-xs font-medium text-violet-400 mb-2">Night Before</h4>
                                      <ul className="text-xs text-gray-300 space-y-1">
                                        {exam.nightBefore.map((item, j) => (
                                          <li key={j}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {exam.morningOf?.length > 0 && (
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                      <h4 className="text-xs font-medium text-amber-400 mb-2">Morning Of</h4>
                                      <ul className="text-xs text-gray-300 space-y-1">
                                        {exam.morningOf.map((item, j) => (
                                          <li key={j}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {exam.duringExam?.length > 0 && (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                      <h4 className="text-xs font-medium text-emerald-400 mb-2">During Exam</h4>
                                      <ul className="text-xs text-gray-300 space-y-1">
                                        {exam.duringExam.map((item, j) => (
                                          <li key={j}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Focus */}
                    {guide.priorityData.weeklyFocus?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span>🎯</span> Weekly Focus Points
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {guide.priorityData.weeklyFocus.map((week, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <div className="text-xs text-indigo-400 font-medium mb-1">Week {week.week}</div>
                              <div className="text-sm font-medium text-white mb-2">{week.oneThingThatMatters}</div>
                              {week.timeboxWarning && (
                                <div className="text-xs text-amber-400 mb-2">⏰ {week.timeboxWarning}</div>
                              )}
                              {week.checkpointQuestion && (
                                <div className="text-xs text-gray-500 italic">
                                  <span className="text-gray-400">Checkpoint:</span> {week.checkpointQuestion}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Weekly Plan Tab */}
            {activeTab === 'weekly' && (
              <div className="space-y-4">
                {!guide.weeklyBattlePlan?.length ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No weekly plan available for this course.</p>
                  </div>
                ) : (
                  guide.weeklyBattlePlan.map((week, index) => (
                    <motion.div
                      key={week.week}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                      <details>
                        <summary className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center gap-4 list-none [&::-webkit-details-marker]:hidden">
                          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            week.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                            week.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            week.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {week.priority}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold">Week {week.week}:</span>
                            <span className="text-gray-400 ml-2">{week.theme}</span>
                          </div>
                          <div className="text-gray-500 text-sm whitespace-nowrap">{week.totalHours}h</div>
                          <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-5 pb-5 space-y-3">
                          {week.tasks?.map((task, i) => (
                            <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors">
                              <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-gray-600 bg-transparent checked:bg-indigo-500 checked:border-indigo-500 flex-shrink-0" />
                              <span className="flex-1">{task.task}</span>
                              <span className="text-gray-500 text-sm whitespace-nowrap">{task.time}h</span>
                            </label>
                          ))}
                          {week.warnings?.map((w, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-400 text-sm">
                              <span>⚠️</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                {!guide.examStrategy?.length ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No exam information found in the syllabus.</p>
                  </div>
                ) : guide.examStrategy.map((exam, index) => (
                  <motion.div
                    key={exam.exam}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">{exam.exam}</h3>
                        <p className="text-gray-400">{exam.date} • {exam.weight}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>🎯</span> High-Yield Topics
                        </h4>
                        <ul className="space-y-2">
                          {exam.highYieldTopics?.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-200">
                              <span className="text-indigo-400 mt-1">•</span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>📆</span> Study Plan
                        </h4>
                        {exam.studyPlan?.startDate && (
                          <p className="text-sm text-gray-500 mb-3">Start: {exam.studyPlan.startDate}</p>
                        )}
                        <div className="space-y-2">
                          {exam.studyPlan?.phases?.map((phase, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                              <span className="text-gray-500 text-sm w-20">{phase.days}</span>
                              <span className="flex-1 text-gray-200">{phase.focus}</span>
                              <span className="text-gray-500 text-sm">{phase.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
              <div className="space-y-6">
                {/* Grade Header with Live Calculation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Grade Calculator</h3>
                    <p className="text-sm text-gray-500">Enter your grades to see your current standing</p>
                  </div>
                  <div className="text-center">
                    <motion.div
                      key={calculatedGrade}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`text-4xl font-bold ${getGradeColor(calculatedGrade)}`}
                    >
                      {calculatedGrade !== null ? calculatedGrade.toFixed(1) : '--'}
                      <span className="text-lg text-gray-500">%</span>
                    </motion.div>
                    <motion.div
                      key={getGradeLetter(calculatedGrade)}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`text-sm font-medium ${getGradeColor(calculatedGrade)}`}
                    >
                      {getGradeLetter(calculatedGrade)}
                    </motion.div>
                  </div>
                </div>

                {/* Progress toward A */}
                {calculatedGrade !== null && calculatedGrade < 90 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-emerald-400 font-medium">Progress to A (90%)</span>
                      <span className="text-sm text-emerald-400">{((calculatedGrade / 90) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-emerald-500/20 rounded-full h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (calculatedGrade / 90) * 100)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}

                {!guide.gradingBreakdown?.components?.length ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No grading information found in the syllabus.</p>
                  </div>
                ) : guide.gradingBreakdown.components.map((component, index) => (
                  <motion.div
                    key={component.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{component.category}</h4>
                      <span className="text-indigo-400 font-semibold">{component.totalWeight}%</span>
                    </div>
                    <div className="space-y-2">
                      {component.items?.map((item, i) => {
                        const gradeKey = `${component.category}-${i}`;
                        const itemGrade = grades[gradeKey];
                        return (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.01 }}
                            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl border transition-all ${
                              itemGrade !== null && itemGrade !== undefined
                                ? itemGrade >= 90
                                  ? 'bg-emerald-500/5 border-emerald-500/20'
                                  : itemGrade >= 80
                                  ? 'bg-blue-500/5 border-blue-500/20'
                                  : itemGrade >= 70
                                  ? 'bg-amber-500/5 border-amber-500/20'
                                  : 'bg-red-500/5 border-red-500/20'
                                : 'bg-white/[0.02] border-white/5'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium block truncate">{item.name}</span>
                              {item.date && <span className="text-gray-500 text-sm">{item.date}</span>}
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className="text-gray-500 text-sm whitespace-nowrap">{item.weight}%</span>
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="--"
                                  min="0"
                                  max="100"
                                  value={itemGrade ?? ''}
                                  onChange={(e) => handleGradeChange(gradeKey, e.target.value)}
                                  className={`w-20 sm:w-24 px-3 py-2 bg-white/5 border rounded-xl text-right focus:outline-none focus:ring-2 transition-all ${
                                    itemGrade !== null && itemGrade !== undefined
                                      ? `${getGradeColor(itemGrade)} border-current/30 focus:ring-current/20`
                                      : 'border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20'
                                  }`}
                                />
                                {itemGrade !== null && itemGrade !== undefined && itemGrade >= 90 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 text-xs"
                                  >
                                    ✨
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {guide.gradingBreakdown?.specialRules && guide.gradingBreakdown.specialRules.length > 0 && (
                  <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="font-medium text-amber-400 mb-2">Special Rules</h4>
                    <ul className="space-y-1">
                      {guide.gradingBreakdown.specialRules.map((rule, i) => (
                        <li key={i} className="text-sm text-gray-300">• {rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Flashcards</h3>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">
                    {guide.flashcardDeck?.length || 0} cards
                  </span>
                </div>

                {!guide.flashcardDeck?.length ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No flashcards generated for this course.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {guide.flashcardDeck.slice(0, 20).map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setFlippedCard(flippedCard === index ? null : index)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`p-5 rounded-2xl border transition-all min-h-[150px] flex items-center justify-center text-center ${
                            flippedCard === index
                              ? 'bg-indigo-500/10 border-indigo-500/30'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                          }`}>
                            <div>
                              {flippedCard === index ? (
                                <motion.div
                                  initial={{ opacity: 0, rotateX: -90 }}
                                  animate={{ opacity: 1, rotateX: 0 }}
                                >
                                  <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Answer</p>
                                  <p className="text-gray-200">{card.back}</p>
                                </motion.div>
                              ) : (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Question</p>
                                  <p className="text-white font-medium">{card.front}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 text-gray-500 text-xs">
                            Click to flip
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {guide.flashcardDeck.length > 20 && (
                      <p className="text-center text-gray-500">
                        + {guide.flashcardDeck.length - 20} more cards
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Export Buttons - Only show for paid users */}
        {!isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-4"
          >
            {/* Main Export Row */}
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToCalendar}
                className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar (.ics)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToMarkdown}
                className="px-5 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Course Plan (.md)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToCSV}
                className="px-5 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Grades (.csv)
              </motion.button>
            </div>

            {/* Spreadsheet Export with Toggle */}
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Export Grade Calculator with Formulas
              </div>

              {/* Spreadsheet Type Toggle */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5">
                <button
                  onClick={() => setSpreadsheetType('sheets')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    spreadsheetType === 'sheets'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Google Sheets
                </button>
                <button
                  onClick={() => setSpreadsheetType('excel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    spreadsheetType === 'excel'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Excel
                </button>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => exportToSpreadsheet(spreadsheetType)}
                  className="px-4 py-2 rounded-xl font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .tsv
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyGradeTable(spreadsheetType)}
                  className="px-4 py-2 rounded-xl font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all flex items-center gap-2 text-sm"
                >
                  {copySuccess === 'grades' ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Help Button */}
            <div className="text-center">
              <button
                onClick={() => setShowExportHelp(true)}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
              >
                How to import into your calendar or spreadsheet?
              </button>
            </div>
          </motion.div>
        )}

        {/* Export Help Modal */}
        <AnimatePresence>
          {showExportHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowExportHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f0f15] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f15]">
                  <h2 className="text-xl font-semibold">Export Guide</h2>
                  <button
                    onClick={() => setShowExportHelp(false)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Calendar Import */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">📅</span>
                      Importing Calendar (.ics)
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="font-medium text-emerald-400 mb-2">Google Calendar</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Click "Download .ics" above</li>
                          <li>Go to <span className="text-white">calendar.google.com</span></li>
                          <li>Click the gear icon → Settings</li>
                          <li>Click "Import & export" in the sidebar</li>
                          <li>Click "Select file from your computer"</li>
                          <li>Choose the downloaded .ics file</li>
                          <li>Select which calendar to add events to</li>
                          <li>Click "Import"</li>
                        </ol>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="font-medium text-blue-400 mb-2">Apple Calendar (Mac/iPhone)</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Click "Download .ics" above</li>
                          <li>Double-click the downloaded file</li>
                          <li>Calendar app will open automatically</li>
                          <li>Choose which calendar to add events to</li>
                          <li>Click "OK" to import</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-2">💡 On iPhone: Open the .ics file from Files app or email</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="font-medium text-violet-400 mb-2">Outlook</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Click "Download .ics" above</li>
                          <li>Open Outlook Calendar</li>
                          <li>File → Open & Export → Import/Export</li>
                          <li>Select "Import an iCalendar (.ics) file"</li>
                          <li>Browse to your downloaded file</li>
                          <li>Click "Import"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Grade Calculator Import */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">📊</span>
                      Importing Grade Calculator
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="font-medium text-emerald-400 mb-2">Google Sheets</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Select "Google Sheets" in the toggle above</li>
                          <li>Click "Copy to Clipboard"</li>
                          <li>Open <span className="text-white">sheets.google.com</span></li>
                          <li>Create a new spreadsheet</li>
                          <li>Click cell A1</li>
                          <li>Press Ctrl+V (or Cmd+V on Mac) to paste</li>
                          <li>Formulas will auto-calculate your grades!</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-2">💡 The formulas auto-calculate weighted averages as you enter grades</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="font-medium text-emerald-400 mb-2">Microsoft Excel</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Select "Excel" in the toggle above</li>
                          <li>Click "Download .tsv"</li>
                          <li>Open Excel</li>
                          <li>File → Open → Browse to downloaded file</li>
                          <li>Select "Tab Delimited" when prompted</li>
                          <li>Click "Finish" to import</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-2">💡 Or use "Copy to Clipboard" and paste directly into Excel</p>
                      </div>
                    </div>
                  </div>

                  {/* Course Plan */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">📝</span>
                      Course Plan (.md)
                    </h3>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-sm text-gray-400 mb-3">
                        The Markdown file works great with:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                        <li><span className="text-white">Notion</span> - Paste or import directly</li>
                        <li><span className="text-white">Obsidian</span> - Drop into your vault</li>
                        <li><span className="text-white">GitHub</span> - View rendered in repos</li>
                        <li><span className="text-white">VS Code</span> - Preview with Markdown extension</li>
                        <li><span className="text-white">Any text editor</span> - Plain text readable</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Home */}
        {!isPreview && (
          <div className="text-center mt-8">
            <a href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
              ← Process another syllabus
            </a>
          </div>
        )}

        {/* Preview Unlock CTA - Scandinavian minimal design */}
        {isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 mb-12"
          >
            <div className="max-w-xl mx-auto text-center">
              {/* Separator line */}
              <div className="w-16 h-px bg-white/20 mx-auto mb-12" />

              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h3 className="text-2xl font-light text-white mb-3">
                Get your own guide
              </h3>

              <p className="text-gray-500 mb-8 leading-relaxed text-sm max-w-md mx-auto">
                Everything above, plus Google Calendar export, grade calculator,
                flashcards, and exam strategies — personalized to your syllabus.
              </p>

              {/* What you get list */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Calendar export
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Grade calculator
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Flashcards
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Exam strategies
                </span>
              </div>

              <a
                href="/"
                className="inline-block px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all"
              >
                Upload Your Syllabus
              </a>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
                <span>$3 single class</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>$8 semester pass</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
