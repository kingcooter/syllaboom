import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV,
    checks: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
    }
  };

  const allHealthy = Object.values(health.checks).every(Boolean);

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
