'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import StudyGuide from '@/components/StudyGuide';
import { exampleGuide } from '@/data/exampleGuide';
import { analytics } from '@/lib/analytics';
import type { StudyGuide as StudyGuideType } from '@/types';

const GENERATION_STEPS = [
  'Verifying payment...',
  'Reading your syllabus...',
  'Extracting course details...',
  'Analyzing topics & difficulty...',
  'Creating your battle plan...',
  'Generating flashcards...',
  'Building your calendar...',
  'Finalizing study guide...',
];

function ResultsContent() {
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState<StudyGuideType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
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
    const loadGuide = async () => {
      // Check if this is the example preview
      const previewMode = searchParams.get('preview') === 'true';
      if (previewMode) {
        setGuide(exampleGuide);
        setIsPreview(true);
        setIsLoading(false);
        return;
      }

      // Check if coming from Stripe success or dev mode
      const sessionId = searchParams.get('session_id');
      const devMode = searchParams.get('dev') === 'true' && process.env.NODE_ENV === 'development';

      // Try to load existing guide from localStorage
      const storedGuide = localStorage.getItem('studyGuide');
      if (storedGuide) {
        setGuide(JSON.parse(storedGuide));
        setIsLoading(false);
        return;
      }

      // If coming from payment OR dev mode, generate the guide
      if (sessionId || devMode) {
        // Verify payment (skip in dev mode)
        if (sessionId && !devMode) {
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
          } catch {
            // Continue anyway if verification fails - benefit of doubt
            console.warn('Payment verification check failed, continuing...');
          }
        }

        const syllabusText = localStorage.getItem('pendingSyllabus');
        if (syllabusText) {
          setIsGenerating(true);
          analytics.guideGenerationStarted();
          const startTime = Date.now();

          // Simulate progress steps - store in ref for cleanup
          stepIntervalRef.current = setInterval(() => {
            setGenerationStep(prev => Math.min(prev + 1, GENERATION_STEPS.length - 1));
          }, 15000); // Update every 15 seconds

          try {
            setGenerationStep(1); // Reading syllabus
            const response = await fetch('/api/generate-guide', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ syllabusText }),
            });

            if (stepIntervalRef.current) {
              clearInterval(stepIntervalRef.current);
              stepIntervalRef.current = null;
            }

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Generation failed');
            }

            const newGuide = await response.json();
            const duration = Date.now() - startTime;
            analytics.guideGenerationCompleted(newGuide.courseCode || 'unknown', duration);

            localStorage.setItem('studyGuide', JSON.stringify(newGuide));
            localStorage.removeItem('pendingSyllabus');
            localStorage.removeItem('pendingFilename');
            setGuide(newGuide);
          } catch (err) {
            if (stepIntervalRef.current) {
              clearInterval(stepIntervalRef.current);
              stepIntervalRef.current = null;
            }
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            analytics.guideGenerationFailed(errorMessage);
            setError(`Failed to generate study guide: ${errorMessage}. Please contact support.`);
          } finally {
            setIsGenerating(false);
          }
        }
      }

      setIsLoading(false);
    };

    loadGuide();
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
              <motion.p
                key={generationStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-medium text-white mb-2"
              >
                {GENERATION_STEPS[generationStep]}
              </motion.p>
              <p className="text-gray-400 text-sm mb-6">
                This usually takes 2-3 minutes
              </p>

              {/* Progress bar */}
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
            <p className="text-gray-300">Loading your study guide...</p>
          )}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
        <a href="/" className="text-blue-400 hover:underline">← Back to home</a>
      </main>
    );
  }

  if (!guide) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl mb-4">No study guide found</div>
        <a href="/" className="text-blue-400 hover:underline">← Upload a syllabus</a>
      </main>
    );
  }

  return <StudyGuide guide={guide} isPreview={isPreview} />;
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
