import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import {
  validatePDFFile,
  validatePDFContent,
  checkRateLimit,
  getClientIP,
  MAX_FILE_SIZE,
  MAX_PAGES
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 'parse-syllabus');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const fileValidation = validatePDFFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const { text, totalPages } = await extractText(buffer);

    // Join text array into string if needed
    const textContent = Array.isArray(text) ? text.join('\n') : text;

    // Validate content
    const contentValidation = validatePDFContent(textContent, totalPages);
    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 422 });
    }

    return NextResponse.json({
      text: textContent,
      pageCount: totalPages,
      filename: file.name,
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please ensure it is a valid, text-based PDF.' },
      { status: 500 }
    );
  }
}
