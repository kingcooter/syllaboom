'use client';

import { motion } from 'framer-motion';

interface PricingToggleProps {
  selected: 'single' | 'semester';
  onChange: (type: 'single' | 'semester') => void;
}

export default function PricingToggle({ selected, onChange }: PricingToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-400">Choose your plan</p>
      <div className="flex gap-4 justify-center">
        {/* Single Class Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange('single')}
          className={`relative flex-1 max-w-[200px] p-5 rounded-2xl border-2 transition-all ${
            selected === 'single'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg text-gray-500 line-through">$5</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              $3
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-1">Single Class</div>
          <div className="text-xs text-indigo-400 mt-1">40% off</div>

          {selected === 'single' && (
            <motion.div
              layoutId="pricing-indicator"
              className="absolute inset-0 rounded-2xl ring-2 ring-indigo-500/50"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>

        {/* Semester Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange('semester')}
          className={`relative flex-1 max-w-[200px] p-5 rounded-2xl border-2 transition-all ${
            selected === 'semester'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
          }`}
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
            >
              BEST VALUE
            </motion.div>
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg text-gray-500 line-through">$18</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              $8
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-1">Semester Pack</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
            <span>Up to 6 classes</span>
            <span className="text-emerald-500">• 55% off</span>
          </div>

          {selected === 'semester' && (
            <motion.div
              layoutId="pricing-indicator"
              className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500/50"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      {/* Stripe Secure Payment Badge */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-500">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <span className="text-xs">Secure payment via</span>
        <span className="text-xs font-semibold text-[#635BFF]">Stripe</span>
      </div>
    </div>
  );
}
