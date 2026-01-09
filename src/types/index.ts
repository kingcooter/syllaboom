export interface GradeItem {
  name: string;
  weight: number;
  date: string | null;
  category: string;
}

export interface GradingComponent {
  category: string;
  totalWeight: number;
  dropLowest?: number;
  items: GradeItem[];
}

export interface GradingBreakdown {
  components: GradingComponent[];
  gradingScale: Record<string, number>;
  specialRules: string[];
}

export interface WeekPlan {
  week: number;
  dates: string;
  topics: string[];
  readings: string[];
  assignments: string[];
  studyTips: string;
}

export interface KeyDate {
  date: string;
  event: string;
  type: 'class' | 'exam' | 'assignment' | 'study' | 'deadline';
}

export interface TopicAnalysis {
  week: number;
  topic: string;
  conceptsYouMustKnow: string[];
  difficultyRating: number;
  hoursToMaster: number;
  commonMisconceptions: string[];
}

export interface DangerZone {
  weeks: number[];
  warning: string;
  reason: string;
  prevention: string;
}

export interface PracticeQuestion {
  type: 'conceptual' | 'calculation' | 'application';
  question: string;
  answer: string;
  difficulty: number;
  topic: string;
}

export interface Flashcard {
  front: string;
  back: string;
  topic: string;
  tags: string[];
}

export interface WeeklyTask {
  task: string;
  when: string;
  time: number;
}

export interface WeeklyBattlePlan {
  week: number;
  dates: string;
  theme: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tasks: WeeklyTask[];
  totalHours: number;
  warnings: string[];
  tips: string[];
}

export interface ExamStrategy {
  exam: string;
  date: string;
  weight: string;
  coverage: string[];
  predictedFormat: Record<string, string>;
  studyPlan: {
    startDate: string;
    phases: { days: string; focus: string; hours: number }[];
  };
  highYieldTopics: string[];
  commonMistakes: string[];
}

export interface CalendarEvent {
  title: string;
  date: string;
  startTime?: string;
  duration?: number;
  type: 'class' | 'exam' | 'assignment' | 'study' | 'deadline' | 'milestone';
  color: string;
}

export interface MeetingSchedule {
  days: string[];
  startTime: string;
  endTime: string;
  timezone?: string;
}

export interface CoreData {
  courseName: string;
  courseCode: string;
  instructor: string;
  semester: string;
  credits: number;
  meetingTimes: string;
  meetingSchedule?: MeetingSchedule;
  location: string;
  officeHours: string;
  textbook: { title: string; author: string; required: boolean } | null;
  weekByWeek: WeekPlan[];
  keyDates: KeyDate[];
  gradingBreakdown: GradingBreakdown;
  policies: {
    lateWork: string;
    attendance: string;
    academicHonesty: string;
  };
}

export interface AnalysisData {
  courseOverview: {
    oneSentence: string;
    whyItMatters: string;
    biggestChallenge: string;
    prerequisiteKnowledge: string[];
  };
  topicAnalysis: TopicAnalysis[];
  dangerZones: DangerZone[];
  professorInsights: {
    gradingEmphasis: string;
    likelyTestFocus: string[];
    hiddenPriorities: string;
  };
}

export interface ContentData {
  weeklyStudyContent: {
    week: number;
    topic: string;
    keyTerms: {
      term: string;
      definition: string;
      example: string;
      commonConfusion: string;
    }[];
    practiceQuestions: PracticeQuestion[];
    selfTestChecklist: string[];
  }[];
  flashcardDeck: Flashcard[];
  formulaSheet: {
    name: string;
    formula: string;
    when: string;
    notes: string;
  }[];
}

export interface StrategyData {
  semesterStrategy: {
    overallApproach: string;
    weeklyTimeCommitment: {
      light: number;
      normal: number;
      heavy: number;
      total: number;
    };
    gradeTargetPaths: {
      A: { requiredAverage: number; strategy: string; riskLevel: string };
      B: { requiredAverage: number; strategy: string; riskLevel: string };
      C: { requiredAverage: number; strategy: string; riskLevel: string };
    };
  };
  examStrategy: ExamStrategy[];
  weeklyBattlePlan: WeeklyBattlePlan[];
  calendarEvents: CalendarEvent[];
}

export interface TopicPriority {
  topic: string;
  week: number;
  roi: 'HIGH' | 'MEDIUM' | 'LOW';
  examWeight: string;
  effortLevel: 'Easy' | 'Medium' | 'Hard';
  verdict: string;
  skipIfDesparate: boolean;
}

export interface GradePath {
  requiredMastery?: string;
  minimumViable?: string;
  timePerWeek: string;
  nonNegotiables?: string[];
  canSlackOn?: string[];
  recoveryRoom?: string;
  safetyMargin?: string;
  survivalStrategy?: string;
}

export interface ExamIntel {
  exam: string;
  predictedTopics: { topic: string; likelihood: string; pointsPrediction: string }[];
  questionTypePredictions: { type: string; count: string; strategy: string }[];
  timeStrategy: { totalMinutes: number; suggestedPacing: string };
  nightBefore: string[];
  morningOf: string[];
  duringExam: string[];
}

export interface WeeklyFocus {
  week: number;
  oneThingThatMatters: string;
  timeboxWarning: string;
  checkpointQuestion: string;
}

export interface PriorityData {
  topicPriority: TopicPriority[];
  mustKnowList: string[];
  canSkipList: string[];
  gradePaths: {
    A: GradePath;
    B: GradePath;
    C: GradePath;
  };
  cramSheet: {
    formulas: string[];
    definitions: string[];
    concepts: string[];
    commonTricks: string[];
  };
  weeklyFocus: WeeklyFocus[];
  examIntel: ExamIntel[];
}

export interface StudyGuide extends CoreData, AnalysisData, ContentData, StrategyData {
  generatedAt: string;
  priorityData?: PriorityData;
}

export interface UploadedFile {
  name: string;
  text: string;
}
