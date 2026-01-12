'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/lib/analytics';

interface FileUploadProps {
  onFileProcessed: (text: string, filename: string) => void;
  disabled?: boolean;
  maxFiles?: number; // How many more files can be added
}

export default function FileUpload({ onFileProcessed, disabled, maxFiles = 6 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const processFile = async (file: File): Promise<boolean> => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError(`${file.name}: Please upload a PDF file`);
      analytics.uploadFailed('invalid_file_type');
      return false;
    }

    if (file.size === 0) {
      setError(`${file.name}: File is empty`);
      analytics.uploadFailed('empty_file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`${file.name}: File too large (max 10MB)`);
      analytics.uploadFailed('file_too_large');
      return false;
    }

    analytics.uploadStarted();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-syllabus', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to parse PDF';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      analytics.uploadCompleted(data.pageCount || 0, file.name);
      onFileProcessed(data.text, file.name);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`${file.name}: ${errorMsg}`);
      analytics.uploadFailed('parse_error');
      console.error(err);
      return false;
    }
  };

  const processFiles = async (files: File[]) => {
    // Filter to only PDFs and limit to maxFiles
    const pdfFiles = files
      .filter(f => f.name.toLowerCase().endsWith('.pdf'))
      .slice(0, maxFiles);

    if (pdfFiles.length === 0) {
      setError('Please upload PDF files');
      return;
    }

    if (files.length > maxFiles) {
      setError(`You can only upload ${maxFiles} more file${maxFiles === 1 ? '' : 's'}`);
      return;
    }

    setIsProcessing(true);
    setProcessingCount(pdfFiles.length);
    setProcessedCount(0);
    setError(null);

    let successCount = 0;
    for (const file of pdfFiles) {
      const success = await processFile(file);
      if (success) successCount++;
      setProcessedCount(prev => prev + 1);
    }

    setIsProcessing(false);
    setProcessingCount(0);
    setProcessedCount(0);

    // Trigger confetti if any succeeded
    if (successCount > 0) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 80 + (successCount * 20),
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
          ticks: 200,
          gravity: 1.2,
          scalar: 0.9,
        });
      }).catch(() => {});
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  }, [maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
    // Reset input so same files can be selected again
    e.target.value = '';
  };

  return (
    <div className="relative">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgb(99, 102, 241)' : 'rgba(255, 255, 255, 0.1)',
        }}
        transition={{ duration: 0.2 }}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-2xl p-8 sm:p-10 md:p-12 text-center transition-all cursor-pointer
          ${isDragging ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10'}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />
        </div>

        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileInput}
          disabled={disabled || isProcessing}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={`relative z-10 block cursor-pointer ${disabled || isProcessing ? 'cursor-not-allowed' : ''}`}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="relative w-16 h-16 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
                  />
                  <div className="absolute inset-2 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-300 font-medium">
                  {processingCount > 1
                    ? `Reading syllabi... (${processedCount + 1}/${processingCount})`
                    : 'Reading your syllabus...'}
                </p>
                <div className="w-48 mx-auto">
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{
                        width: processingCount > 1
                          ? `${((processedCount + 0.5) / processingCount) * 100}%`
                          : '100%'
                      }}
                      transition={{ duration: processingCount > 1 ? 0.3 : 2, ease: 'easeInOut' }}
                      className="progress-bar-fill"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  className="relative w-20 h-20 mx-auto"
                >
                  {/* Document icon with animation */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {/* Floating plus icon */}
                  <motion.div
                    animate={{
                      y: [0, -3, 0],
                      opacity: isDragging ? 1 : 0.7,
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                </motion.div>

                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    {isDragging ? 'Drop them here!' : `Drop your syllab${maxFiles === 1 ? 'us' : 'i'}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    PDF format • {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Any class, any school'}
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Browse files
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        {/* Drag overlay effect */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-500/5 rounded-2xl border-2 border-indigo-500 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
