/**
 * Simple Test Route - Verify API is working
 * GET /api/sketch/test
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API route is working',
    timestamp: new Date().toISOString(),
    runtime: process.env.VERCEL ? 'vercel' : 'local',
    nodeVersion: process.version
  });
}
