import { z } from 'zod';

// API Request Schemas
export const generateGuideSchema = z.object({
  syllabusText: z
    .string()
    .min(100, 'Syllabus text too short - please upload a valid syllabus')
    .max(500000, 'Syllabus text too long - please upload a smaller PDF'),
});

export const createCheckoutSchema = z.object({
  priceType: z.enum(['single', 'semester']),
  email: z.string().email('Please provide a valid email address'),
});

// File validation
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PAGES = 50;
export const ALLOWED_MIME_TYPES = ['application/pdf'];

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  // Note: MIME type can be spoofed, but it's a basic check
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF' };
  }

  return { valid: true };
}

// Validate extracted PDF content
export function validatePDFContent(text: string, pageCount: number): { valid: boolean; error?: string } {
  if (!text || text.trim().length < 50) {
    return { valid: false, error: 'Could not extract text from PDF. It may be scanned or image-based.' };
  }

  if (pageCount > MAX_PAGES) {
    return { valid: false, error: `PDF has too many pages (${pageCount}). Maximum is ${MAX_PAGES} pages.` };
  }

  return { valid: true };
}

// Simple in-memory rate limiting for serverless
// Note: This resets on cold starts, but good enough for basic protection
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'parse-syllabus': { windowMs: 60 * 60 * 1000, maxRequests: 20 },  // 20 per hour
  'generate-guide': { windowMs: 60 * 60 * 1000, maxRequests: 10 },  // 10 per hour
  'create-checkout': { windowMs: 60 * 60 * 1000, maxRequests: 30 }, // 30 per hour
  'verify-payment': { windowMs: 60 * 60 * 1000, maxRequests: 50 },  // 50 per hour
};

export function checkRateLimit(
  identifier: string,
  endpoint: string
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    return { allowed: true, remaining: 999, resetIn: 0 };
  }

  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) rateLimitStore.delete(k);
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    // Rate limited
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  // Increment and allow
  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetIn: record.resetAt - now };
}

// Get client IP from request headers
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}
