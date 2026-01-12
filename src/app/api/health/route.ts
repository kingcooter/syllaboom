import { NextResponse } from 'next/server';

export async function GET() {
  // Check all required services are configured
  const checks = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
  };

  const allHealthy = Object.values(checks).every(Boolean);

  // Return minimal info publicly - don't expose version, env, or specific check details
  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    }
  );
}
