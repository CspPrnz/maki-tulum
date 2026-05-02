import { NextResponse } from 'next/server';

/**
 * Liveness probe. Railway healthcheck path must match an actual route.
 * Lesson from Civion Safe: missing /healthz causes Railway restart loops.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'maki-web',
    version: process.env['npm_package_version'] ?? '0.0.1',
    timestamp: new Date().toISOString(),
  });
}
