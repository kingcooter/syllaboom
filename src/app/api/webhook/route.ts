import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Validate signature exists before proceeding
  if (!signature) {
    console.error('Webhook error: Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 401 }
    );
  }

  // Validate webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      // Could store in DB or send email here
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Log safely without exposing signature details
    const message = error instanceof Error ? error.message : 'Webhook verification failed';
    console.error('Webhook error:', message);
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 400 }
    );
  }
}
