import type { StudyGuide } from '@/types';

export const exampleGuide: StudyGuide = {
  // Core Data
  courseName: "Introduction to Psychology",
  courseCode: "PSY 101",
  instructor: "Dr. Sarah Mitchell",
  semester: "Spring 2026",
  credits: 3,
  meetingTimes: "MWF 10:00-10:50 AM",
  meetingSchedule: {
    days: ["Monday", "Wednesday", "Friday"],
    startTime: "10:00",
    endTime: "10:50",
    timezone: "America/New_York"
  },
  location: "Psychology Building, Room 150",
  officeHours: "Tuesdays 2-4 PM, Thursdays 1-3 PM",
  textbook: {
    title: "Psychology: Themes and Variations",
    author: "Wayne Weiten",
    required: true
  },
  weekByWeek: [
    { week: 1, dates: "Jan 13-17", topics: ["What is Psychology?", "History of Psychology"], readings: ["Chapter 1"], assignments: ["Syllabus Quiz due Friday"], studyTips: "Focus on understanding the scientific method in psychology" },
    { week: 2, dates: "Jan 20-24", topics: ["Research Methods", "Ethics in Research"], readings: ["Chapter 2"], assignments: ["Research Methods Worksheet"], studyTips: "Know the difference between correlational and experimental studies" },
    { week: 3, dates: "Jan 27-31", topics: ["The Brain and Nervous System"], readings: ["Chapter 3"], assignments: ["Brain Diagram due Friday"], studyTips: "Use diagrams to memorize brain regions" },
    { week: 4, dates: "Feb 3-7", topics: ["Sensation and Perception"], readings: ["Chapter 4"], assignments: ["Perception Lab Report"], studyTips: "Focus on the difference between sensation and perception" },
    { week: 5, dates: "Feb 10-14", topics: ["States of Consciousness", "Sleep and Dreams"], readings: ["Chapter 5"], assignments: ["Sleep Journal due Friday"], studyTips: "Understand sleep stages and their characteristics" },
    { week: 6, dates: "Feb 17-21", topics: ["Midterm 1 Review", "MIDTERM 1 (Friday)"], readings: ["Chapters 1-5"], assignments: ["MIDTERM 1 - Feb 21"], studyTips: "Start reviewing Week 1-5 material NOW" },
    { week: 7, dates: "Feb 24-28", topics: ["Learning: Classical Conditioning"], readings: ["Chapter 6"], assignments: ["Conditioning Examples"], studyTips: "Memorize Pavlov's experiment terminology" },
    { week: 8, dates: "Mar 3-7", topics: ["Learning: Operant Conditioning"], readings: ["Chapter 6"], assignments: ["Reinforcement Schedule Assignment"], studyTips: "Create your own examples for each type of reinforcement" },
    { week: 9, dates: "Mar 10-14", topics: ["SPRING BREAK"], readings: [], assignments: [], studyTips: "Rest up but review flashcards 15 min/day" },
    { week: 10, dates: "Mar 17-21", topics: ["Memory: Encoding and Storage"], readings: ["Chapter 7"], assignments: ["Memory Techniques Paper"], studyTips: "Apply memory techniques to your own studying" },
    { week: 11, dates: "Mar 24-28", topics: ["Memory: Retrieval and Forgetting"], readings: ["Chapter 7"], assignments: ["Study for Midterm 2"], studyTips: "Understand why we forget - this is heavily tested" },
    { week: 12, dates: "Mar 31-Apr 4", topics: ["Midterm 2 Review", "MIDTERM 2 (Friday)"], readings: ["Chapters 6-7"], assignments: ["MIDTERM 2 - Apr 4"], studyTips: "Focus on Learning and Memory chapters" },
    { week: 13, dates: "Apr 7-11", topics: ["Motivation and Emotion"], readings: ["Chapter 10"], assignments: ["Emotion Journal"], studyTips: "Know the major theories of emotion" },
    { week: 14, dates: "Apr 14-18", topics: ["Personality Theories"], readings: ["Chapter 12"], assignments: ["Personality Assessment"], studyTips: "Compare and contrast the Big 5 vs other models" },
    { week: 15, dates: "Apr 21-25", topics: ["Psychological Disorders"], readings: ["Chapter 14"], assignments: ["Case Study Analysis"], studyTips: "Focus on DSM criteria for major disorders" },
    { week: 16, dates: "Apr 28-May 2", topics: ["Treatment of Disorders", "Final Review"], readings: ["Chapter 15"], assignments: ["Final Exam Study Guide"], studyTips: "Create comprehensive review sheets" },
  ],
  keyDates: [
    { date: "2026-01-13", event: "First Day of Class", type: "class" },
    { date: "2026-02-21", event: "Midterm 1", type: "exam" },
    { date: "2026-04-04", event: "Midterm 2", type: "exam" },
    { date: "2026-05-08", event: "Final Exam (10:00 AM)", type: "exam" },
  ],
  gradingBreakdown: {
    components: [
      {
        category: "Exams",
        totalWeight: 60,
        items: [
          { name: "Midterm 1", weight: 20, date: "2026-02-21", category: "Exams" },
          { name: "Midterm 2", weight: 20, date: "2026-04-04", category: "Exams" },
          { name: "Final Exam", weight: 20, date: "2026-05-08", category: "Exams" },
        ]
      },
      {
        category: "Assignments",
        totalWeight: 25,
        dropLowest: 1,
        items: [
          { name: "Research Methods Worksheet", weight: 5, date: "2026-01-24", category: "Assignments" },
          { name: "Brain Diagram", weight: 5, date: "2026-01-31", category: "Assignments" },
          { name: "Perception Lab Report", weight: 5, date: "2026-02-07", category: "Assignments" },
          { name: "Sleep Journal", weight: 5, date: "2026-02-14", category: "Assignments" },
          { name: "Memory Techniques Paper", weight: 5, date: "2026-03-21", category: "Assignments" },
        ]
      },
      {
        category: "Participation",
        totalWeight: 15,
        items: [
          { name: "iClicker Participation", weight: 10, date: null, category: "Participation" },
          { name: "Discussion Posts", weight: 5, date: null, category: "Participation" },
        ]
      }
    ],
    gradingScale: { "A": 93, "A-": 90, "B+": 87, "B": 83, "B-": 80, "C+": 77, "C": 73, "C-": 70, "D": 60, "F": 0 },
    specialRules: ["Lowest assignment grade dropped", "No makeup exams without documented emergency"]
  },
  policies: {
    lateWork: "10% penalty per day, maximum 3 days late",
    attendance: "iClicker participation required; 3 absences allowed",
    academicHonesty: "Zero tolerance for cheating; automatic F in course"
  },

  // Analysis Data
  courseOverview: {
    oneSentence: "A broad introduction to how the mind works, covering everything from brain biology to social behavior.",
    whyItMatters: "Understanding psychology helps you understand yourself, improve relationships, and succeed in any career involving people.",
    biggestChallenge: "The sheer volume of terminology and the need to apply concepts, not just memorize them.",
    prerequisiteKnowledge: ["Basic biology concepts", "Critical thinking skills", "Ability to read scientific studies"]
  },
  topicAnalysis: [
    { week: 1, topic: "Introduction to Psychology", conceptsYouMustKnow: ["Scientific method", "Nature vs nurture", "Major perspectives (behavioral, cognitive, biological)"], difficultyRating: 2, hoursToMaster: 3, commonMisconceptions: ["Psychology is just common sense", "Freud represents all of psychology"] },
    { week: 2, topic: "Research Methods", conceptsYouMustKnow: ["Independent vs dependent variables", "Correlation vs causation", "Random assignment", "Double-blind studies"], difficultyRating: 4, hoursToMaster: 6, commonMisconceptions: ["Correlation implies causation", "Case studies prove general rules"] },
    { week: 3, topic: "The Brain", conceptsYouMustKnow: ["Neuron structure", "Neurotransmitters", "Brain regions and functions", "Plasticity"], difficultyRating: 5, hoursToMaster: 8, commonMisconceptions: ["We only use 10% of our brain", "Left-brain/right-brain personality types"] },
    { week: 4, topic: "Sensation and Perception", conceptsYouMustKnow: ["Absolute vs difference thresholds", "Gestalt principles", "Top-down vs bottom-up processing"], difficultyRating: 4, hoursToMaster: 5, commonMisconceptions: ["We perceive reality directly", "Subliminal messages control behavior"] },
    { week: 5, topic: "Consciousness", conceptsYouMustKnow: ["Sleep stages", "REM vs NREM", "Sleep disorders", "Effects of sleep deprivation"], difficultyRating: 3, hoursToMaster: 4, commonMisconceptions: ["Everyone needs 8 hours", "You can catch up on sleep"] },
    { week: 7, topic: "Classical Conditioning", conceptsYouMustKnow: ["UCS, UCR, CS, CR", "Acquisition, extinction, spontaneous recovery", "Generalization and discrimination"], difficultyRating: 4, hoursToMaster: 5, commonMisconceptions: ["Conditioning is manipulation", "It only works on animals"] },
    { week: 8, topic: "Operant Conditioning", conceptsYouMustKnow: ["Positive/negative reinforcement", "Positive/negative punishment", "Schedules of reinforcement", "Shaping"], difficultyRating: 4, hoursToMaster: 5, commonMisconceptions: ["Negative reinforcement = punishment", "Punishment is always effective"] },
    { week: 10, topic: "Memory Encoding", conceptsYouMustKnow: ["Sensory, short-term, long-term memory", "Encoding strategies", "Levels of processing"], difficultyRating: 3, hoursToMaster: 4, commonMisconceptions: ["Memory works like a video recorder", "Photographic memory exists"] },
    { week: 11, topic: "Memory Retrieval", conceptsYouMustKnow: ["Recall vs recognition", "Retrieval cues", "Forgetting curve", "False memories"], difficultyRating: 4, hoursToMaster: 5, commonMisconceptions: ["Forgotten = erased", "Eyewitness testimony is reliable"] },
  ],
  dangerZones: [
    { weeks: [5, 6], warning: "Pre-Midterm Crunch Zone", reason: "Week 5 material is still being learned while you need to review Weeks 1-4 for the midterm", prevention: "Start Midterm 1 review by Week 4. Don't fall behind on consciousness material." },
    { weeks: [11, 12], warning: "Memory Overload + Midterm 2", reason: "Memory chapter is content-heavy AND you're preparing for Midterm 2", prevention: "Use the memory techniques you're learning to study for the exam. Meta!" },
    { weeks: [15, 16], warning: "Final Sprint", reason: "Psychological disorders is the densest chapter, followed immediately by finals", prevention: "Pre-read Chapter 14 during Week 14. Create disorder comparison charts early." }
  ],
  professorInsights: {
    gradingEmphasis: "Dr. Mitchell emphasizes application over memorization. Expect scenario-based questions.",
    likelyTestFocus: ["Distinguishing between similar concepts", "Real-world applications", "Research methodology", "Brain structures and functions"],
    hiddenPriorities: "Office hours mentioned frequently - attending correlates with higher grades. She values students who ask questions."
  },

  // Content Data
  weeklyStudyContent: [
    {
      week: 1,
      topic: "Introduction to Psychology",
      keyTerms: [
        { term: "Psychology", definition: "The scientific study of behavior and mental processes", example: "Studying why people conform in groups", commonConfusion: "Not just therapy or reading minds" },
        { term: "Empiricism", definition: "Knowledge comes from observation and experience", example: "Running experiments to test theories", commonConfusion: "Different from intuition or common sense" },
        { term: "Nature vs Nurture", definition: "Debate over genetic vs environmental influences", example: "Are introverts born or made?", commonConfusion: "It's not either/or - it's interaction" },
      ],
      practiceQuestions: [
        { type: "conceptual", question: "Why is psychology considered a science rather than just philosophy?", answer: "Psychology uses the scientific method: systematic observation, hypothesis testing, and replication. Unlike philosophy, claims must be empirically testable.", difficulty: 2, topic: "Scientific Method" },
        { type: "application", question: "A researcher wants to know if caffeine improves memory. What's the independent variable?", answer: "Caffeine consumption (what the researcher manipulates). Memory performance is the dependent variable.", difficulty: 3, topic: "Research Variables" },
      ],
      selfTestChecklist: ["Can I name the 5 major perspectives in psychology?", "Can I explain why correlation doesn't equal causation?", "Can I identify IV and DV in a study description?"]
    },
    {
      week: 3,
      topic: "The Brain and Nervous System",
      keyTerms: [
        { term: "Neuron", definition: "A nerve cell that transmits electrical and chemical signals", example: "Motor neurons carry signals from brain to muscles", commonConfusion: "Neurons don't touch - they communicate across synapses" },
        { term: "Neurotransmitter", definition: "Chemical messengers that cross synapses", example: "Dopamine is involved in reward and motivation", commonConfusion: "Low serotonin doesn't simply 'cause' depression" },
        { term: "Plasticity", definition: "The brain's ability to change and reorganize", example: "London taxi drivers have larger hippocampi", commonConfusion: "Doesn't mean you can grow new brain regions at will" },
        { term: "Amygdala", definition: "Brain structure involved in emotion, especially fear", example: "Activates during scary movie scenes", commonConfusion: "Not the only emotion center - works with other areas" },
      ],
      practiceQuestions: [
        { type: "conceptual", question: "What would happen if neurotransmitters couldn't be reabsorbed?", answer: "They'd keep stimulating the receiving neuron. This is how some drugs work - SSRIs block serotonin reuptake.", difficulty: 4, topic: "Neural Communication" },
        { type: "application", question: "A patient can understand speech but can't produce it. Which brain area is likely damaged?", answer: "Broca's area (left frontal lobe). Damage causes Broca's aphasia - understanding without fluent production.", difficulty: 4, topic: "Brain Regions" },
      ],
      selfTestChecklist: ["Can I trace a neural signal from dendrite to axon terminal?", "Can I name 4 neurotransmitters and their functions?", "Can I identify the four lobes and their primary functions?"]
    },
    {
      week: 7,
      topic: "Classical Conditioning",
      keyTerms: [
        { term: "Unconditioned Stimulus (UCS)", definition: "A stimulus that naturally triggers a response", example: "Food causing salivation", commonConfusion: "Must be unlearned/automatic" },
        { term: "Conditioned Stimulus (CS)", definition: "Previously neutral stimulus that triggers response after pairing", example: "Bell causing salivation after pairing with food", commonConfusion: "Starts neutral, becomes meaningful" },
        { term: "Extinction", definition: "Weakening of CR when CS presented alone repeatedly", example: "Dog stops salivating to bell if food never follows", commonConfusion: "Response isn't erased - can show spontaneous recovery" },
      ],
      practiceQuestions: [
        { type: "application", question: "A child gets sick after eating strawberry ice cream. Now they feel nauseous seeing any pink food. Identify the UCS, UCR, CS, and CR.", answer: "UCS: illness/virus. UCR: nausea from illness. CS: pink food (generalized from strawberry ice cream). CR: nausea to pink food.", difficulty: 3, topic: "Classical Conditioning" },
        { type: "conceptual", question: "Why might a phobia persist even when the person knows it's irrational?", answer: "Classical conditioning operates below conscious awareness. The amygdala triggers fear before the cortex can rationalize. Avoidance prevents extinction.", difficulty: 4, topic: "Conditioning and Emotion" },
      ],
      selfTestChecklist: ["Can I diagram Pavlov's experiment with all terms?", "Can I explain spontaneous recovery?", "Can I identify conditioning in advertising examples?"]
    },
  ],
  flashcardDeck: [
    { front: "What is the difference between sensation and perception?", back: "Sensation = detecting stimuli (eyes receive light). Perception = interpreting stimuli (brain recognizes a face).", topic: "Week 4", tags: ["fundamental", "comparison"] },
    { front: "Name the 4 lobes of the brain and one function each", back: "Frontal (planning, decision-making), Parietal (touch, spatial), Temporal (hearing, language), Occipital (vision)", topic: "Week 3", tags: ["brain", "must-know"] },
    { front: "What's the difference between negative reinforcement and punishment?", back: "Negative reinforcement INCREASES behavior by removing something unpleasant. Punishment DECREASES behavior.", topic: "Week 8", tags: ["learning", "commonly-confused"] },
    { front: "What are the stages of sleep in order?", back: "Stage 1 (light) → Stage 2 (sleep spindles) → Stage 3 (deep/delta) → REM (dreams, paralysis). Cycles repeat.", topic: "Week 5", tags: ["consciousness", "sequence"] },
    { front: "Correlation coefficient of -0.85 means what?", back: "Strong negative relationship. As one variable increases, the other decreases. Does NOT mean causation.", topic: "Week 2", tags: ["research", "statistics"] },
    { front: "What is the primacy effect?", back: "Better recall of items at the BEGINNING of a list. Related to transfer to long-term memory.", topic: "Week 10", tags: ["memory", "must-know"] },
    { front: "What is the recency effect?", back: "Better recall of items at the END of a list. Related to items still in short-term memory.", topic: "Week 10", tags: ["memory", "must-know"] },
    { front: "Define: Confirmation bias", back: "Tendency to search for/interpret info that confirms existing beliefs. We ignore contradicting evidence.", topic: "Week 2", tags: ["bias", "critical-thinking"] },
    { front: "What neurotransmitter is associated with Parkinson's disease?", back: "Dopamine (deficiency). The substantia nigra degenerates, reducing dopamine production.", topic: "Week 3", tags: ["brain", "disorders"] },
    { front: "What is the Garcia effect?", back: "Taste aversion learned in one trial. Evolutionarily adaptive - avoid poisonous foods after single bad experience.", topic: "Week 7", tags: ["learning", "evolution"] },
  ],
  formulaSheet: [
    { name: "Forgetting Curve", formula: "Retention = e^(-t/S)", when: "Week 11", notes: "Ebbinghaus showed memory decays exponentially. Spaced repetition fights this." },
    { name: "Signal Detection", formula: "d' = z(Hit Rate) - z(False Alarm Rate)", when: "Week 4", notes: "Measures sensitivity independent of response bias. Higher d' = better discrimination." },
  ],

  // Strategy Data
  semesterStrategy: {
    overallApproach: "This is a reading-heavy course with concept application on exams. Success comes from consistent weekly reading + active recall practice, not last-minute cramming.",
    weeklyTimeCommitment: { light: 5, normal: 7, heavy: 12, total: 120 },
    gradeTargetPaths: {
      A: { requiredAverage: 93, strategy: "Read before each lecture, attend all classes, start exam prep 10 days early, visit office hours at least 3x", riskLevel: "Achievable with consistent effort" },
      B: { requiredAverage: 83, strategy: "Keep up with readings, attend most classes, start exam prep 7 days early", riskLevel: "Very achievable" },
      C: { requiredAverage: 73, strategy: "Don't skip exams, submit all assignments, cram the key concepts before tests", riskLevel: "Comfortable buffer" }
    }
  },
  examStrategy: [
    {
      exam: "Midterm 1",
      date: "2026-02-21",
      weight: "20%",
      coverage: ["Week 1: Intro to Psych", "Week 2: Research Methods", "Week 3: The Brain", "Week 4: Sensation & Perception", "Week 5: Consciousness"],
      predictedFormat: { "multipleChoice": "50%", "shortAnswer": "30%", "essay": "20%" },
      studyPlan: {
        startDate: "2026-02-11",
        phases: [
          { days: "10-7 before", focus: "Re-read notes, create concept maps for each chapter", hours: 6 },
          { days: "6-4 before", focus: "Flashcard review, practice questions from each chapter", hours: 8 },
          { days: "3-2 before", focus: "Take practice exam, identify weak areas", hours: 4 },
          { days: "1 before", focus: "Light review of weak areas, good sleep", hours: 2 }
        ]
      },
      highYieldTopics: ["Research methods terminology", "Brain regions and functions", "Gestalt principles"],
      commonMistakes: ["Confusing correlation with causation on research questions", "Mixing up brain lobes", "Running out of time on essays"]
    },
    {
      exam: "Final Exam",
      date: "2026-05-08",
      weight: "20%",
      coverage: ["Cumulative - All chapters with emphasis on Weeks 13-16"],
      predictedFormat: { "multipleChoice": "60%", "shortAnswer": "25%", "essay": "15%" },
      studyPlan: {
        startDate: "2026-04-28",
        phases: [
          { days: "10-7 before", focus: "Review all midterm material, focus on concepts you missed", hours: 8 },
          { days: "6-4 before", focus: "Deep dive into Weeks 13-16 (Motivation, Personality, Disorders, Treatment)", hours: 10 },
          { days: "3-2 before", focus: "Full practice exam, cramsheet review", hours: 6 },
          { days: "1 before", focus: "Skim cramsheet, rest well", hours: 2 }
        ]
      },
      highYieldTopics: ["Psychological disorders (DSM criteria)", "Treatment approaches", "Personality theories comparison", "All conditioning terminology"],
      commonMistakes: ["Spending too much time on early material", "Confusing similar disorders", "Not pacing properly on cumulative exam"]
    }
  ],
  weeklyBattlePlan: [
    { week: 1, dates: "Jan 13-17", theme: "Foundation Building", priority: "MEDIUM", tasks: [{ task: "Read Chapter 1", when: "Before Monday", time: 1.5 }, { task: "Attend all lectures", when: "MWF 10am", time: 2.5 }, { task: "Complete Syllabus Quiz", when: "By Friday", time: 0.5 }], totalHours: 4.5, warnings: [], tips: ["First week sets the tone - establish your routine now"] },
    { week: 3, dates: "Jan 27-31", theme: "Brain Deep Dive", priority: "HIGH", tasks: [{ task: "Read Chapter 3 (dense!)", when: "Before Monday", time: 2.5 }, { task: "Create brain region flashcards", when: "Tuesday", time: 1.5 }, { task: "Complete Brain Diagram", when: "By Friday", time: 2 }, { task: "Review with 3D brain model", when: "Thursday", time: 1 }], totalHours: 9.5, warnings: ["This is the hardest chapter - don't fall behind"], tips: ["Use online 3D brain tools", "Draw diagrams repeatedly"] },
    { week: 6, dates: "Feb 17-21", theme: "MIDTERM 1 WEEK", priority: "CRITICAL", tasks: [{ task: "Final review of Weeks 1-5", when: "Mon-Wed", time: 6 }, { task: "Take practice exam", when: "Wednesday", time: 2 }, { task: "Review weak areas", when: "Thursday", time: 2 }, { task: "MIDTERM 1", when: "Friday 10am", time: 0 }], totalHours: 10, warnings: ["This is it - no new content, pure review"], tips: ["Get 8 hours sleep Thursday night", "Eat breakfast before exam"] },
    { week: 9, dates: "Mar 10-14", theme: "Spring Break", priority: "LOW", tasks: [{ task: "Light flashcard review", when: "15 min/day", time: 1.75 }], totalHours: 1.75, warnings: [], tips: ["Rest is important - but don't completely forget the material", "Review learning/conditioning since you'll build on it"] },
    { week: 12, dates: "Mar 31-Apr 4", theme: "MIDTERM 2 WEEK", priority: "CRITICAL", tasks: [{ task: "Review Learning chapters", when: "Mon-Tue", time: 4 }, { task: "Review Memory chapter", when: "Wed", time: 3 }, { task: "Practice exam", when: "Thursday", time: 2 }, { task: "MIDTERM 2", when: "Friday", time: 0 }], totalHours: 9, warnings: ["Memory chapter is tricky - focus on retrieval concepts"], tips: ["Use memory techniques to study memory - very meta!"] },
  ],
  calendarEvents: [
    { title: "PSY 101 Lecture", date: "2026-01-13", startTime: "10:00", duration: 50, type: "class", color: "blue" },
    { title: "Start Midterm 1 Prep", date: "2026-02-11", type: "study", color: "yellow" },
    { title: "MIDTERM 1", date: "2026-02-21", startTime: "10:00", duration: 75, type: "exam", color: "red" },
    { title: "Start Midterm 2 Prep", date: "2026-03-25", type: "study", color: "yellow" },
    { title: "MIDTERM 2", date: "2026-04-04", startTime: "10:00", duration: 75, type: "exam", color: "red" },
    { title: "Start Final Prep", date: "2026-04-28", type: "study", color: "yellow" },
    { title: "FINAL EXAM", date: "2026-05-08", startTime: "10:00", duration: 120, type: "exam", color: "red" },
  ],

  // Priority Data
  priorityData: {
    topicPriority: [
      { topic: "Research Methods", week: 2, roi: "HIGH", examWeight: "~15% of every exam", effortLevel: "Medium", verdict: "MASTER THIS - appears on every exam and in everyday life", skipIfDesparate: false },
      { topic: "The Brain", week: 3, roi: "HIGH", examWeight: "~20% of Midterm 1", effortLevel: "Hard", verdict: "Worth the effort - foundational and heavily tested", skipIfDesparate: false },
      { topic: "Classical Conditioning", week: 7, roi: "HIGH", examWeight: "~25% of Midterm 2", effortLevel: "Medium", verdict: "Core concept - must know cold", skipIfDesparate: false },
      { topic: "Memory", week: 10, roi: "HIGH", examWeight: "~25% of Midterm 2", effortLevel: "Medium", verdict: "Directly applicable to your studying", skipIfDesparate: false },
      { topic: "Psychological Disorders", week: 15, roi: "HIGH", examWeight: "~30% of Final", effortLevel: "Hard", verdict: "Largest chunk of final - prioritize", skipIfDesparate: false },
      { topic: "History of Psychology", week: 1, roi: "LOW", examWeight: "~5%", effortLevel: "Easy", verdict: "Know the major figures, skip the details", skipIfDesparate: true },
      { topic: "Sleep Stages", week: 5, roi: "MEDIUM", examWeight: "~10%", effortLevel: "Easy", verdict: "Memorize the stages, don't overthink", skipIfDesparate: true },
    ],
    mustKnowList: [
      "Independent vs Dependent Variables - asked on EVERY exam",
      "Correlation ≠ Causation - Dr. Mitchell's favorite point",
      "The 4 brain lobes and their functions",
      "Classical conditioning terminology (UCS, UCR, CS, CR)",
      "Positive/negative reinforcement vs punishment distinction",
      "Encoding, storage, retrieval stages of memory",
      "DSM criteria for major disorders (depression, anxiety, schizophrenia)"
    ],
    canSkipList: [
      "Detailed history of psychology schools - just know behaviorism, cognitive, humanistic",
      "Specific sleep study researchers - know the concepts not the names",
      "Obscure brain structures - focus on major regions only",
      "Treatment drug names - know categories not specific medications"
    ],
    gradePaths: {
      A: { requiredMastery: "All concepts + ability to apply them to novel scenarios", timePerWeek: "8-10 hours", nonNegotiables: ["All readings before lecture", "Office hours 2x/month", "Practice tests for each exam"], safetyMargin: "Can miss 1 assignment and still get A if exams are strong" },
      B: { requiredMastery: "Core concepts + basic application", timePerWeek: "6-8 hours", canSlackOn: ["Detailed history", "Specific researcher names", "Optional readings"], recoveryRoom: "Can bomb one exam (get 70%) and still pull B with strong other exams" },
      C: { minimumViable: "Show up, submit work, know key terms", timePerWeek: "4-5 hours", survivalStrategy: "Focus on multiple choice prep - that's 50-60% of each exam. Know definitions cold." }
    },
    cramSheet: {
      formulas: ["Forgetting curve: exponential decay", "Signal detection: d' = sensitivity"],
      definitions: [
        "Psychology: scientific study of behavior and mental processes",
        "Neurotransmitter: chemical messengers crossing synapses",
        "Classical conditioning: learning through association",
        "Operant conditioning: learning through consequences"
      ],
      concepts: [
        "Correlation ≠ Causation",
        "Nature AND Nurture (interaction)",
        "Memory is reconstructive, not recording",
        "Negative reinforcement ≠ Punishment"
      ],
      commonTricks: [
        "Double negatives in punishment questions",
        "Scenario questions where you identify conditioning type",
        "'Which is NOT' questions - read all options",
        "Brain damage scenarios - match region to function"
      ]
    },
    weeklyFocus: [
      { week: 1, oneThingThatMatters: "Understand that psychology is a SCIENCE with methods", timeboxWarning: "Don't spend more than 30 min on history of psychology", checkpointQuestion: "Can you design a simple experiment with IV and DV?" },
      { week: 3, oneThingThatMatters: "Master the major brain regions and their functions", timeboxWarning: "Don't memorize every tiny structure - focus on the big ones", checkpointQuestion: "If someone has damage to Broca's area, what happens?" },
      { week: 6, oneThingThatMatters: "MIDTERM 1 - you should be reviewing, not learning new material", timeboxWarning: "If you don't know it by Wednesday, focus on what you DO know", checkpointQuestion: "Can you explain 3 concepts from each of Weeks 1-5?" },
      { week: 8, oneThingThatMatters: "Nail the difference between reinforcement and punishment", timeboxWarning: "Don't overthink schedules of reinforcement - know the 4 types", checkpointQuestion: "Is taking away a teenager's phone positive or negative punishment?" },
    ],
    examIntel: [
      {
        exam: "Midterm 1",
        predictedTopics: [
          { topic: "Research Methods", likelihood: "Very Likely", pointsPrediction: "~15-20 points" },
          { topic: "Brain Regions", likelihood: "Very Likely", pointsPrediction: "~20 points" },
          { topic: "Sensation vs Perception", likelihood: "Likely", pointsPrediction: "~10-15 points" },
          { topic: "Sleep Stages", likelihood: "Likely", pointsPrediction: "~10 points" },
        ],
        questionTypePredictions: [
          { type: "Multiple choice on definitions", count: "25-30 questions", strategy: "Process of elimination, watch for 'NOT' and 'EXCEPT'" },
          { type: "Short answer on application", count: "4-5 questions", strategy: "Use specific terminology, give examples" },
          { type: "Essay on research design", count: "1 question", strategy: "Include IV, DV, controls, potential confounds" }
        ],
        timeStrategy: { totalMinutes: 75, suggestedPacing: "40 min for MC (1.5 min each), 20 min for short answer, 15 min for essay" },
        nightBefore: ["Review flashcards one final time", "Get 8 hours of sleep", "Prepare pencils and student ID"],
        morningOf: ["Eat protein-rich breakfast", "Quick 10-min review of brain regions", "Arrive 10 min early"],
        duringExam: ["Read ALL options before answering MC", "Skip hard questions, come back", "For essays, outline before writing"]
      }
    ]
  },

  generatedAt: new Date().toISOString(),
};
