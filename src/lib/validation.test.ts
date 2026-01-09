import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateGuideSchema,
  createCheckoutSchema,
  validatePDFFile,
  validatePDFContent,
  checkRateLimit,
  MAX_FILE_SIZE,
  MAX_PAGES,
} from './validation';

describe('generateGuideSchema', () => {
  it('accepts valid syllabus text', () => {
    const validText = 'a'.repeat(200); // Min 100 chars
    const result = generateGuideSchema.safeParse({ syllabusText: validText });
    expect(result.success).toBe(true);
  });

  it('rejects text that is too short', () => {
    const shortText = 'a'.repeat(50);
    const result = generateGuideSchema.safeParse({ syllabusText: shortText });
    expect(result.success).toBe(false);
  });

  it('rejects text that is too long', () => {
    const longText = 'a'.repeat(600000);
    const result = generateGuideSchema.safeParse({ syllabusText: longText });
    expect(result.success).toBe(false);
  });

  it('rejects missing syllabusText', () => {
    const result = generateGuideSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('createCheckoutSchema', () => {
  it('accepts valid single checkout', () => {
    const result = createCheckoutSchema.safeParse({
      priceType: 'single',
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid semester checkout', () => {
    const result = createCheckoutSchema.safeParse({
      priceType: 'semester',
      email: 'student@university.edu',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid price type', () => {
    const result = createCheckoutSchema.safeParse({
      priceType: 'yearly',
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createCheckoutSchema.safeParse({
      priceType: 'single',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = createCheckoutSchema.safeParse({
      priceType: 'single',
    });
    expect(result.success).toBe(false);
  });
});

describe('validatePDFFile', () => {
  it('accepts valid PDF file', () => {
    const file = new File(['content'], 'syllabus.pdf', { type: 'application/pdf' });
    const result = validatePDFFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects non-PDF file', () => {
    const file = new File(['content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const result = validatePDFFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('PDF');
  });

  it('rejects file that is too large', () => {
    // Create a mock file object with large size
    const largeFile = {
      name: 'large.pdf',
      size: MAX_FILE_SIZE + 1,
      type: 'application/pdf',
    } as File;
    const result = validatePDFFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('large');
  });
});

describe('validatePDFContent', () => {
  it('accepts valid content', () => {
    const text = 'This is a valid syllabus with enough content to pass validation.';
    const result = validatePDFContent(text, 10);
    expect(result.valid).toBe(true);
  });

  it('rejects empty text', () => {
    const result = validatePDFContent('', 10);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('extract');
  });

  it('rejects too short text', () => {
    const result = validatePDFContent('short', 10);
    expect(result.valid).toBe(false);
  });

  it('rejects too many pages', () => {
    const text = 'This is a valid syllabus with enough content to pass the text length validation check.';
    const result = validatePDFContent(text, MAX_PAGES + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('pages');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset rate limit store between tests by using unique identifiers
  });

  it('allows first request', () => {
    const result = checkRateLimit(`test-ip-${Date.now()}`, 'parse-syllabus');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('allows multiple requests within limit', () => {
    const ip = `test-ip-multi-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, 'parse-syllabus');
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks after exceeding limit', () => {
    const ip = `test-ip-block-${Date.now()}`;
    // Exhaust the limit (20 for parse-syllabus)
    for (let i = 0; i < 20; i++) {
      checkRateLimit(ip, 'parse-syllabus');
    }
    // Next request should be blocked
    const result = checkRateLimit(ip, 'parse-syllabus');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns unlimited for unknown endpoints', () => {
    const result = checkRateLimit('any-ip', 'unknown-endpoint');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });
});
