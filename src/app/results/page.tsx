'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import StudyGuide from '@/components/StudyGuide';
import { exampleGuide } from '@/data/exampleGuide';
import { analytics } from '@/lib/analytics';
import type { StudyGuide as StudyGuideType } from '@/types';

interface UploadedSyllabus {
  id: string;
  text: string;
  filename: string;
}

const GENERATION_STEPS = [
  'Verifying payment...',
  'Reading your syllabus...',
  'Extracting course details...',
  'Analyzing topics & difficulty...',
  'Creating your battle plan...',
  'Building exam strategies...',
  'Building your calendar...',
  'Finalizing study guide...',
];

function ResultsContent() {
  const searchParams = useSearchParams();
  const [guides, setGuides] = useState<StudyGuideType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [currentSyllabusIndex, setCurrentSyllabusIndex] = useState(0);
  const [totalSyllabi, setTotalSyllabi] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadGuides = async () => {
      // Check if this is the example preview
      const previewMode = searchParams.get('preview') === 'true';
      if (previewMode) {
        setGuides([exampleGuide]);
        setIsPreview(true);
        setIsLoading(false);
        return;
      }

      // Check if coming from Stripe success or dev mode
      const sessionId = searchParams.get('session_id');
      const devMode = searchParams.get('dev') === 'true' && process.env.NODE_ENV === 'development';
      const forceRegenerate = searchParams.get('regenerate') === 'true';
      const isRetry = searchParams.get('retry') === 'true';

      // Check for pending syllabi (new array format) or legacy single syllabus
      const pendingSyllabiRaw = localStorage.getItem('pendingSyllabi');
      const legacySyllabusText = localStorage.getItem('pendingSyllabus');
      const hasPendingSyllabi = !!(pendingSyllabiRaw || legacySyllabusText);

      // In dev mode with pending syllabi, or with regenerate flag, or retrying, skip cached guides
      const shouldRegenerateGuides = (devMode && hasPendingSyllabi) || forceRegenerate || isRetry;

      // Try to load existing guides from localStorage (unless we should regenerate)
      if (!shouldRegenerateGuides) {
        const storedGuides = localStorage.getItem('studyGuides');
        if (storedGuides) {
          try {
            const parsed = JSON.parse(storedGuides);
            // Validate it's an array with at least one valid guide
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.courseName) {
              setGuides(parsed);
              setIsLoading(false);
              return;
            } else {
              localStorage.removeItem('studyGuides');
            }
          } catch (parseError) {
            console.error('Failed to parse stored guides:', parseError);
            localStorage.removeItem('studyGuides');
          }
        }
        // Also try legacy single guide format
        const storedGuide = localStorage.getItem('studyGuide');
        if (storedGuide) {
          try {
            const parsed = JSON.parse(storedGuide);
            if (parsed && typeof parsed === 'object' && parsed.courseName) {
              setGuides([parsed]);
              setIsLoading(false);
              return;
            } else {
              localStorage.removeItem('studyGuide');
            }
          } catch (parseError) {
            console.error('Failed to parse stored guide:', parseError);
            localStorage.removeItem('studyGuide');
          }
        }
      }

      // Check for existing verified payment (allows retry after failure)
      const storedPayment = localStorage.getItem('verifiedPayment');
      let hasVerifiedPayment = false;
      let paymentType: string | null = null;

      if (storedPayment) {
        try {
          const payment = JSON.parse(storedPayment);
          // Payment is valid for 24 hours
          if (payment.verifiedAt && Date.now() - payment.verifiedAt < 24 * 60 * 60 * 1000) {
            hasVerifiedPayment = true;
            paymentType = payment.type;
          } else {
            localStorage.removeItem('verifiedPayment');
          }
        } catch {
          localStorage.removeItem('verifiedPayment');
        }
      }

      // If coming from payment OR dev mode OR has verified payment OR retrying, generate the guides
      if (sessionId || devMode || hasVerifiedPayment || isRetry) {
        // Verify payment (skip in dev mode or if already verified)
        if (sessionId && !devMode && !hasVerifiedPayment) {
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });
            const verification = await verifyResponse.json();
            if (!verification.verified) {
              setError('Payment verification failed. Please contact support if you were charged.');
              setIsLoading(false);
              return;
            }
            // Store verified payment for retry capability
            const priceType = searchParams.get('type') || 'single';
            localStorage.setItem('verifiedPayment', JSON.stringify({
              sessionId,
              type: priceType,
              verifiedAt: Date.now(),
            }));
            hasVerifiedPayment = true;
            paymentType = priceType;
          } catch {
            // Continue anyway if verification fails - benefit of doubt
            console.warn('Payment verification check failed, continuing...');
          }
        }

        // Get syllabi to process
        let syllabiToProcess: UploadedSyllabus[] = [];

        if (pendingSyllabiRaw) {
          try {
            syllabiToProcess = JSON.parse(pendingSyllabiRaw);
          } catch {
            console.error('Failed to parse pending syllabi');
          }
        } else if (legacySyllabusText) {
          // Handle legacy single syllabus format
          syllabiToProcess = [{
            id: 'legacy',
            text: legacySyllabusText,
            filename: localStorage.getItem('pendingFilename') || 'syllabus.pdf',
          }];
        }

        if (syllabiToProcess.length > 0) {
          setIsGenerating(true);
          setTotalSyllabi(syllabiToProcess.length);
          analytics.guideGenerationStarted();
          const startTime = Date.now();
          const generatedGuides: StudyGuideType[] = [];

          // Process each syllabus sequentially
          for (let i = 0; i < syllabiToProcess.length; i++) {
            const syllabus = syllabiToProcess[i];
            setCurrentSyllabusIndex(i);
            setGenerationStep(0);

            // Progress steps for this syllabus
            stepIntervalRef.current = setInterval(() => {
              setGenerationStep(prev => Math.min(prev + 1, GENERATION_STEPS.length - 1));
            }, 12000); // Update every 12 seconds

            try {
              setGenerationStep(1);
              const response = await fetch('/api/generate-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syllabusText: syllabus.text }),
              });

              if (stepIntervalRef.current) {
                clearInterval(stepIntervalRef.current);
                stepIntervalRef.current = null;
              }

              if (!response.ok) {
                let errorMessage = 'Generation failed';
                try {
                  const errorData = await response.json();
                  errorMessage = errorData.error || errorMessage;
                } catch {
                  // Response wasn't JSON - use default message
                }
                throw new Error(`${syllabus.filename}: ${errorMessage}`);
              }

              let newGuide;
              try {
                newGuide = await response.json();
              } catch {
                throw new Error(`${syllabus.filename}: Invalid response from server`);
              }

              if (!newGuide || !newGuide.courseName) {
                throw new Error(`${syllabus.filename}: Generated guide is missing required data`);
              }

              // Add source filename to guide for reference
              newGuide.sourceFilename = syllabus.filename;
              generatedGuides.push(newGuide);

            } catch (err) {
              if (stepIntervalRef.current) {
                clearInterval(stepIntervalRef.current);
                stepIntervalRef.current = null;
              }
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              analytics.guideGenerationFailed(errorMessage);

              // Save any successfully generated guides
              if (generatedGuides.length > 0) {
                localStorage.setItem('studyGuides', JSON.stringify(generatedGuides));
                setGuides(generatedGuides);
              }

              // Update pending syllabi to only include remaining ones
              const remainingSyllabi = syllabiToProcess.slice(i);
              if (remainingSyllabi.length > 0) {
                localStorage.setItem('pendingSyllabi', JSON.stringify(remainingSyllabi));
              }

              setError(`Failed to generate study guide: ${errorMessage}. ${generatedGuides.length > 0 ? `${generatedGuides.length} guide(s) saved. ` : ''}You can retry the remaining syllabi.`);
              setIsGenerating(false);
              setIsLoading(false);
              return;
            }
          }

          // All syllabi processed successfully
          const duration = Date.now() - startTime;
          analytics.guideGenerationCompleted(
            generatedGuides.map(g => g.courseCode || 'unknown').join(', '),
            duration
          );

          // Store all guides
          localStorage.setItem('studyGuides', JSON.stringify(generatedGuides));
          // Clean up pending data
          localStorage.removeItem('pendingSyllabi');
          localStorage.removeItem('pendingSyllabus');
          localStorage.removeItem('pendingFilename');

          setGuides(generatedGuides);
          setIsGenerating(false);
        }
      }

      setIsLoading(false);
    };

    loadGuides();
  }, [searchParams]);

  if (isLoading || isGenerating) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Animated spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
          />

          {/* Progress step */}
          {isGenerating && (
            <>
              {/* Multi-syllabus progress indicator */}
              {totalSyllabi > 1 && (
                <p className="text-indigo-400 text-sm font-medium mb-3">
                  Processing syllabus {currentSyllabusIndex + 1} of {totalSyllabi}
                </p>
              )}

              <motion.p
                key={`${currentSyllabusIndex}-${generationStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-medium text-white mb-2"
              >
                {GENERATION_STEPS[generationStep]}
              </motion.p>
              <p className="text-gray-400 text-sm mb-6">
                {totalSyllabi > 1
                  ? `This usually takes ${totalSyllabi * 2}-${totalSyllabi * 3} minutes for ${totalSyllabi} syllabi`
                  : 'This usually takes 2-3 minutes'}
              </p>

              {/* Overall progress bar for multiple syllabi */}
              {totalSyllabi > 1 && (
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentSyllabusIndex) / totalSyllabi) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              {/* Current syllabus progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((generationStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-1">
                {GENERATION_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= generationStep ? 'bg-indigo-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {!isGenerating && (
            <p className="text-gray-300">Loading your study guides...</p>
          )}
        </div>
      </main>
    );
  }

  if (error) {
    const hasPendingSyllabi = !!localStorage.getItem('pendingSyllabi');
    const hasVerifiedPayment = !!localStorage.getItem('verifiedPayment');
    const canRetry = hasPendingSyllabi && hasVerifiedPayment;

    return (
      <main className="min-h-screen bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-16">
          {/* Error message */}
          <div className="max-w-xl mx-auto text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-6">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <button
                  onClick={() => window.location.href = '/results?retry=true'}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Retry Generation
                </button>
              )}
              <a
                href="/"
                className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
              >
                ← Back to home
              </a>
            </div>
          </div>

          {/* Show any successfully generated guides */}
          {guides.length > 0 && (
            <div className="mt-8">
              <p className="text-center text-gray-400 mb-4">Successfully generated {guides.length} guide(s):</p>
              <StudyGuide guides={guides} isPreview={false} />
            </div>
          )}
        </div>
      </main>
    );
  }

  if (guides.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl mb-4">No study guides found</div>
        <a href="/" className="text-blue-400 hover:underline">← Upload a syllabus</a>
      </main>
    );
  }

  return <StudyGuide guides={guides} isPreview={isPreview} />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading...</p>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
