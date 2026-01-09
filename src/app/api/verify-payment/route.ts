import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { checkRateLimit, getClientIP } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent brute force
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 'verify-payment');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { verified: false, error: 'Too many verification attempts' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { verified: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { sessionId } = body;

    // Validate session ID exists and has correct format
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { verified: false, error: 'No session ID provided' },
        { status: 400 }
      );
    }

    // Validate Stripe session ID format (starts with cs_test_ or cs_live_)
    if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
      return NextResponse.json(
        { verified: false, error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        verified: true,
        type: session.metadata?.type || 'single',
        email: session.customer_email,
      });
    }

    return NextResponse.json({
      verified: false,
      error: 'Payment not completed',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
