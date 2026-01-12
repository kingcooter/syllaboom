'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import PricingToggle from '@/components/PricingToggle';
import { analytics } from '@/lib/analytics';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Syllabus limits by pricing tier
const SYLLABUS_LIMITS = {
  single: 1,
  semester: 6,
};

interface UploadedSyllabus {
  id: string;
  text: string;
  filename: string;
}

export default function Home() {
  const [priceType, setPriceType] = useState<'single' | 'semester'>('single');
  const [syllabi, setSyllabi] = useState<UploadedSyllabus[]>([]);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check for existing verified payment with pending syllabi
  useEffect(() => {
    const storedPayment = localStorage.getItem('verifiedPayment');
    const pendingSyllabi = localStorage.getItem('pendingSyllabi');

    if (storedPayment && pendingSyllabi) {
      try {
        const payment = JSON.parse(storedPayment);
        const syllabi = JSON.parse(pendingSyllabi);
        // Payment valid for 24 hours
        if (payment.verifiedAt && Date.now() - payment.verifiedAt < 24 * 60 * 60 * 1000 && syllabi.length > 0) {
          setHasPendingPayment(true);
          setPendingCount(syllabi.length);
        }
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const isValidEmail = EMAIL_REGEX.test(email);
  const maxSyllabi = SYLLABUS_LIMITS[priceType];
  const canAddMore = syllabi.length < maxSyllabi;

  const handleFileProcessed = (text: string, name: string) => {
    if (!canAddMore) return;

    const newSyllabus: UploadedSyllabus = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      filename: name,
    };

    setSyllabi(prev => [...prev, newSyllabus]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleRemoveSyllabus = (id: string) => {
    setSyllabi(prev => prev.filter(s => s.id !== id));
  };

  const handleCheckout = async () => {
    if (syllabi.length === 0 || !isValidEmail || isCheckingOut) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    analytics.checkoutStarted(priceType, email);
    analytics.emailCaptured('checkout');

    // Store all syllabi for processing after payment
    localStorage.setItem('pendingSyllabi', JSON.stringify(syllabi));

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType, email }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Invalid checkout response');
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      const message = err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out. Please try again.'
        : 'Failed to start checkout. Please try again.';
      setCheckoutError(message);
      setIsCheckingOut(false);
    }
  };

  const handlePriceChange = (type: 'single' | 'semester') => {
    setPriceType(type);
    analytics.pricingSelected(type);
  };

  const handlePreviewExample = () => {
    analytics.previewViewed();
    window.location.href = '/results?preview=true';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <span className="px-5 py-2.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wide">
              AI-Powered Study System
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Drop your syllabus.
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Get your A.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn any syllabus into a complete study system in 90 seconds.
          </p>

          {/* Value Props - Above the Fold */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8 max-w-3xl mx-auto">
            {[
              { icon: '📅', text: 'Calendar Export' },
              { icon: '📊', text: 'Grade Calculator' },
              { icon: '⚔️', text: 'Battle Plan' },
              { icon: '⚠️', text: 'Danger Alerts' },
              { icon: '🎯', text: 'Exam Strategy' },
            ].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-white/[0.03] border border-white/10 text-gray-300 hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </span>
            ))}
          </div>

          <a
            href="/results?preview=true"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
          >
            See a full example
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>

        {/* Pending Payment Banner */}
        <AnimatePresence>
          {hasPendingPayment && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto mb-6"
            >
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-emerald-400 font-medium">You have {pendingCount} syllab{pendingCount === 1 ? 'us' : 'i'} ready to process</p>
                    <p className="text-sm text-gray-400">Your previous payment is still valid</p>
                  </div>
                  <a
                    href="/results?retry=true"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm"
                  >
                    Continue
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 border border-white/5 shadow-2xl">
            {/* Pricing - moved above upload so users choose plan first */}
            <div className="mb-8">
              <PricingToggle selected={priceType} onChange={handlePriceChange} />
            </div>

            {/* File Upload */}
            {canAddMore && (
              <FileUpload onFileProcessed={handleFileProcessed} />
            )}

            {/* Uploaded syllabi list */}
            <AnimatePresence>
              {syllabi.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={canAddMore ? 'mt-4' : ''}
                >
                  <div className="space-y-2">
                    {/* Counter */}
                    <div className="flex items-center justify-between px-1 mb-3">
                      <span className="text-sm text-gray-400">
                        {syllabi.length} of {maxSyllabi} syllab{maxSyllabi === 1 ? 'us' : 'i'} uploaded
                      </span>
                      {priceType === 'single' && syllabi.length === 1 && (
                        <span className="text-xs text-indigo-400">
                          Upgrade to semester for up to 6
                        </span>
                      )}
                    </div>

                    {/* File list */}
                    {syllabi.map((syllabus, index) => (
                      <motion.div
                        key={syllabus.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{syllabus.filename}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSyllabus(syllabus.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white flex-shrink-0"
                          aria-label={`Remove ${syllabus.filename}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}

                    {/* Add more prompt */}
                    {canAddMore && syllabi.length > 0 && (
                      <p className="text-center text-xs text-gray-500 pt-2">
                        Drop or browse to add {maxSyllabi - syllabi.length} more
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Section */}
            <AnimatePresence>
              {syllabi.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-4"
                >
                  <div>
                    <label htmlFor="checkout-email" className="sr-only">Email address</label>
                    <input
                      id="checkout-email"
                      type="email"
                      placeholder="Your email (for receipt)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={254}
                      className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 transition-all placeholder-gray-500 ${
                        email && !isValidEmail
                          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                          : 'border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20'
                      }`}
                    />
                    {email && !isValidEmail && (
                      <p className="mt-1.5 text-xs text-red-400">Please enter a valid email address</p>
                    )}
                  </div>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {checkoutError}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: isCheckingOut ? 1 : 1.02 }}
                    whileTap={{ scale: isCheckingOut ? 1 : 0.98 }}
                    onClick={handleCheckout}
                    disabled={!isValidEmail || isCheckingOut}
                    className="w-full py-5 rounded-2xl font-semibold text-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    {isCheckingOut ? 'Processing...' : `Get My Study System — $${priceType === 'single' ? '1.79' : '4.89'}`}
                  </motion.button>

                  <button
                    onClick={handlePreviewExample}
                    className="w-full py-4 rounded-2xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    See example first
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Real Results Showcase - Moved up for better conversion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 md:mt-28"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              What you get
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Real exports from real syllabi — ready for your calendar and spreadsheets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {/* Calendar - Class Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] p-2.5 transition-all group-hover:border-indigo-500/30 group-hover:bg-white/[0.04]">
                <div className="rounded-xl overflow-hidden shadow-2xl relative">
                  <Image
                    src="/syllaboom_class_notif_ical.png"
                    alt="Full course calendar with every class, exam, and assignment"
                    width={570}
                    height={490}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <span className="text-base">📅</span>
                  Full Course Calendar
                </div>
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                  Every class, exam & assignment — plug and play into Apple or Google Calendar
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    One-click import
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    .ics file
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Grade Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] p-2.5 transition-all group-hover:border-emerald-500/30 group-hover:bg-white/[0.04]">
                <div className="rounded-xl overflow-hidden shadow-2xl relative">
                  <Image
                    src="/syllaboom_grade_calculator.png"
                    alt="Grade calculator with auto-generated formulas in Google Sheets"
                    width={570}
                    height={490}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <span className="text-base">📊</span>
                  Smart Grade Calculator
                </div>
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                  Auto-generated formulas with your syllabus weights — just enter grades
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Weighted formulas
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Google Sheets
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Calendar - Quiz Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] p-2.5 transition-all group-hover:border-violet-500/30 group-hover:bg-white/[0.04]">
                <div className="rounded-xl overflow-hidden shadow-2xl relative">
                  <Image
                    src="/syllaboom_quiz_notif_ical.png"
                    alt="Built-in reminder alerts for quizzes and deadlines"
                    width={570}
                    height={490}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <span className="text-base">🔔</span>
                  Built-in Reminders
                </div>
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                  Automatic alerts before every quiz, exam & deadline — never miss a due date
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    2-day alerts
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Same-day alerts
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Integration logos */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs mb-3">Works with</p>
            <div className="flex items-center justify-center gap-5 text-gray-500">
              <span className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                </svg>
                Apple Calendar
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                </svg>
                Google Calendar
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                </svg>
                Google Sheets
              </span>
            </div>
          </div>
        </motion.div>

        {/* Value Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-28 md:mt-36 text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 tracking-tight">
            Everything you need to ace your class
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            One upload. Complete study system. Exported to your favorite tools.
          </p>
        </motion.div>

        {/* Features Grid - 2x3 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {[
            {
              icon: '📅',
              title: 'Calendar Export',
              description: 'Add every exam, assignment, and deadline to Google Calendar, Apple Calendar, or Outlook with one click.',
              highlight: '.ics file — works everywhere',
              color: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '📊',
              title: 'Grade Calculator',
              description: 'Enter grades as you go. See your weighted average update in real-time. Know what you need on the final.',
              highlight: 'Export to Excel/Sheets',
              color: 'from-emerald-500/20 to-teal-500/20',
            },
            {
              icon: '⚔️',
              title: 'Battle Plan',
              description: 'Your semester mapped out week by week. Topics, readings, and assignments organized with study hours calculated.',
              highlight: 'Stay ahead of the game',
              color: 'from-violet-500/20 to-purple-500/20',
            },
            {
              icon: '⚠️',
              title: 'Danger Alerts',
              description: 'AI identifies the hardest weeks—when exams overlap, papers pile up, and workload peaks.',
              highlight: 'Be warned in advance',
              color: 'from-red-500/20 to-orange-500/20',
            },
            {
              icon: '🎯',
              title: 'Exam Strategy',
              description: 'For each exam: high-yield topics, study timeline, and prep phases. Know what to focus on.',
              highlight: 'Targeted prep',
              color: 'from-pink-500/20 to-rose-500/20',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="card-hover p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 group"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl mb-4 group-hover:scale-105 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>
              <span className="inline-block text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full">
                {feature.highlight}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-32 md:mt-40"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14 tracking-tight">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Drop your PDF', desc: 'Upload any syllabus from any class' },
              { step: '2', title: 'AI analyzes it', desc: 'We extract dates, weights, topics—everything' },
              { step: '3', title: 'Get your system', desc: 'Calendar, grades, and battle plan in 90 seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-32 md:mt-40 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 tracking-tight">Questions?</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What do I get?',
                a: 'A complete study guide with week-by-week battle plan, exam strategies, grade calculator, and calendar export to Google/Apple. Everything customized to YOUR syllabus.',
              },
              {
                q: 'How fast is it?',
                a: 'About 90 seconds. Our AI reads your syllabus and generates everything in parallel.',
              },
              {
                q: 'Do you store my data?',
                a: 'No. Your syllabus is processed and immediately discarded. Results are stored in your browser only.',
              },
              {
                q: "What if it doesn't work?",
                a: 'Full refund, no questions asked. Email us and we\'ll sort it out.',
              },
            ].map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors">
                  <span className="font-medium text-white">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 pt-3 text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-32 md:mt-40 pt-10 border-t border-white/5 text-center text-gray-500 text-sm pb-8">
          <p className="mb-6">
            Questions?{' '}
            <a href="mailto:hello@syllaboom.com" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              hello@syllaboom.com
            </a>
          </p>
          <div className="flex items-center justify-center gap-6">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
            <span className="text-gray-600">© 2026 Syllaboom</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
