import { callLLM, parseJSON } from './openrouter';
import { PROMPT_CORE, PROMPT_ANALYSIS, PROMPT_CONTENT, PROMPT_STRATEGY, PROMPT_PRIORITY } from './prompts';
import type { CoreData, AnalysisData, ContentData, StrategyData, PriorityData, StudyGuide } from '@/types';

export async function generateStudyGuide(syllabusText: string): Promise<StudyGuide> {
  console.log('Starting pipeline...');

  // Call 1: Core extraction
  console.log('Call 1: Extracting core data...');
  const coreResponse = await callLLM(
    PROMPT_CORE,
    `Extract data from this syllabus:\n\n${syllabusText}`
  );
  const coreData = await parseJSON<CoreData>(coreResponse);
  console.log('Core data extracted:', coreData.courseName);

  // Calls 2 & 3: Run in parallel
  console.log('Calls 2 & 3: Analysis and content (parallel)...');
  const [analysisResponse, contentResponse] = await Promise.all([
    callLLM(
      PROMPT_ANALYSIS,
      `Analyze this course:\n\nCourse: ${coreData.courseName}\nCode: ${coreData.courseCode}\nTopics: ${JSON.stringify(coreData.weekByWeek)}`
    ),
    callLLM(
      PROMPT_CONTENT,
      `Create study content for:\n\nCourse: ${coreData.courseName}\nTopics by week: ${JSON.stringify(coreData.weekByWeek)}`
    ),
  ]);

  const analysisData = await parseJSON<AnalysisData>(analysisResponse);
  const contentData = await parseJSON<ContentData>(contentResponse);
  console.log('Analysis and content complete');

  // Calls 4 & 5: Strategy and Priority Intel (parallel)
  console.log('Calls 4 & 5: Strategy and priority intel (parallel)...');

  const priorityPrompt = `Analyze this course for strategic prioritization:

Course: ${coreData.courseName}
Code: ${coreData.courseCode}
Instructor: ${coreData.instructor}
Topics by week: ${JSON.stringify(coreData.weekByWeek)}
Grading: ${JSON.stringify(coreData.gradingBreakdown)}
Exams: ${JSON.stringify(analysisData.topicAnalysis)}
Danger zones: ${JSON.stringify(analysisData.dangerZones)}

Provide strategic intel on what matters most for the grade.`;

  const [strategyResponse, priorityResponse] = await Promise.all([
    callLLM(
      PROMPT_STRATEGY,
      `Create semester strategy for:\n\nCourse: ${coreData.courseName}\nGrading: ${JSON.stringify(coreData.gradingBreakdown)}\nWeeks: ${JSON.stringify(coreData.weekByWeek)}\nDanger zones: ${JSON.stringify(analysisData.dangerZones)}`
    ),
    callLLM(PROMPT_PRIORITY, priorityPrompt),
  ]);

  const strategyData = await parseJSON<StrategyData>(strategyResponse);
  let priorityData: PriorityData | undefined;

  try {
    priorityData = await parseJSON<PriorityData>(priorityResponse);
    console.log('Priority intel complete');
  } catch (err) {
    console.warn('Failed to parse priority data:', err);
    priorityData = undefined;
  }

  console.log('Strategy complete');

  // Merge all data
  const studyGuide: StudyGuide = {
    ...coreData,
    ...analysisData,
    ...contentData,
    ...strategyData,
    priorityData,
    generatedAt: new Date().toISOString(),
  };

  return studyGuide;
}
