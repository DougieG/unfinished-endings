/**
 * Test if Sharp works on Vercel
 * GET /api/sketch/test-sharp
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try to import sharp
    const sharp = (await import('sharp')).default;
    
    // Try to create a simple image
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();
    
    return NextResponse.json({
      status: 'ok',
      message: 'Sharp is working!',
      sharpVersion: sharp.versions,
      testImageSize: buffer.length,
      platform: process.platform,
      arch: process.arch
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Sharp failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
