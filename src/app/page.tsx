'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '@/components/FileUpload';
import PricingToggle from '@/components/PricingToggle';
import { analytics } from '@/lib/analytics';

export default function Home() {
  const [priceType, setPriceType] = useState<'single' | 'semester'>('single');
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileProcessed = (text: string, name: string) => {
    setSyllabusText(text);
    setFilename(name);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCheckout = async () => {
    if (!syllabusText) return;

    analytics.checkoutStarted(priceType, email);
    analytics.emailCaptured('checkout');

    localStorage.setItem('pendingSyllabus', syllabusText);
    localStorage.setItem('pendingFilename', filename || 'syllabus.pdf');

    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceType, email }),
    });

    const { url } = await response.json();
    window.location.href = url;
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

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI-Powered Study System
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Drop your syllabus.
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Get your A.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Turn any syllabus into a complete study system in 90 seconds.
          </p>

          {/* Value Props - Above the Fold */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { icon: '📅', text: 'Export to Google/Apple Calendar' },
              { icon: '📊', text: 'Grade calculator → Excel/Sheets' },
              { icon: '⚔️', text: 'Week-by-week battle plan' },
              { icon: '⚠️', text: 'Danger zone alerts' },
              { icon: '🎯', text: 'Exam strategy guides' },
            ].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/5 border border-white/10 text-gray-300"
              >
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>

          <a
            href="/results?preview=true"
            className="inline-block text-indigo-400 hover:text-indigo-300 transition-colors text-sm underline underline-offset-4"
          >
            See a full example →
          </a>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl">
            {/* File Upload */}
            <FileUpload onFileProcessed={handleFileProcessed} />

            {/* Success indicator */}
            <AnimatePresence>
              {filename && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-medium text-emerald-400">Ready to analyze</p>
                      <p className="text-sm text-gray-400">{filename}</p>
                    </div>
                    <button
                      onClick={() => { setSyllabusText(null); setFilename(null); }}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pricing */}
            <div className="mt-8">
              <PricingToggle selected={priceType} onChange={handlePriceChange} />
            </div>

            {/* CTA Section */}
            <AnimatePresence>
              {syllabusText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-4"
                >
                  <input
                    type="email"
                    placeholder="Your email (for receipt)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-500"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={!email}
                    className="w-full py-5 rounded-2xl font-semibold text-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Get My Study System — ${priceType === 'single' ? '3' : '8'}
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

        {/* Value Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Everything you need to ace your class</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            One upload. Complete study system. Exported to your favorite tools.
          </p>
        </motion.div>

        {/* Features Grid - 2x3 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: '📅',
              title: 'Export to Google & Apple Calendar',
              description: 'One click to add every exam, assignment, and deadline to your calendar. Works with Google Calendar, Apple Calendar, and Outlook. Reminders included.',
              highlight: '.ics file — works everywhere',
              color: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '📊',
              title: 'Live Grade Calculator',
              description: 'Enter grades as you go. See your weighted average update in real-time. Know exactly what you need on the final.',
              highlight: 'Export to Excel/Sheets',
              color: 'from-emerald-500/20 to-teal-500/20',
            },
            {
              icon: '⚔️',
              title: 'Week-by-Week Battle Plan',
              description: 'Your entire semester mapped out. Topics, readings, and assignments organized by week. Study hours calculated.',
              highlight: 'Stay ahead of the game',
              color: 'from-violet-500/20 to-purple-500/20',
            },
            {
              icon: '⚠️',
              title: 'Danger Zone Alerts',
              description: 'AI identifies the hardest weeks—when exams overlap, papers are due, and workload peaks. Plan ahead or crash and burn.',
              highlight: 'Be warned in advance',
              color: 'from-red-500/20 to-orange-500/20',
            },
            {
              icon: '🎯',
              title: 'Exam Strategy Guide',
              description: 'For each exam: high-yield topics, study timeline, and prep phases. Know what to focus on and when to start.',
              highlight: 'Targeted prep',
              color: 'from-pink-500/20 to-rose-500/20',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="card-hover p-6 rounded-2xl bg-white/[0.02] border border-white/5 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{feature.description}</p>
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
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
          className="mt-24"
        >
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Drop your PDF', desc: 'Upload any syllabus from any class' },
              { step: '2', title: 'AI analyzes it', desc: 'We extract dates, weights, topics, everything' },
              { step: '3', title: 'Get your system', desc: 'Calendar, grade calc, and battle plan in 90 seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-24 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Questions?</h2>
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
                <summary className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <span className="font-medium">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 pt-2 text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm pb-8">
          <p>
            Questions?{' '}
            <a href="mailto:hello@syllaboom.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              hello@syllaboom.com
            </a>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <span className="text-gray-700">•</span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
            <span className="text-gray-700">•</span>
            <span>© 2026 Syllaboom</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
