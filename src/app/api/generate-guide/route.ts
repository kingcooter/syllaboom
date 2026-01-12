import { NextRequest, NextResponse } from 'next/server';
import { generateStudyGuide } from '@/lib/pipeline';
import { generateGuideSchema, checkRateLimit, getClientIP } from '@/lib/validation';

export const maxDuration = 300; // Allow up to 5 minutes for the pipeline

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 'generate-guide');

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

    const body = await request.json();

    // Validate input
    const validation = generateGuideSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { syllabusText } = validation.data;
    const studyGuide = await generateStudyGuide(syllabusText);

    return NextResponse.json(studyGuide);
  } catch (error) {
    // Log full error server-side only
    console.error('Generation error:', error);
    // Return generic message to client - never expose internal error details
    return NextResponse.json(
      { error: 'Failed to generate study guide. Please try again.' },
      { status: 500 }
    );
  }
}
