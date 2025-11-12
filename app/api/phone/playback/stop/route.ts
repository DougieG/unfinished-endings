import { NextResponse } from 'next/server';
import { PhoneSessionManager } from '@/lib/phone-audio';

/**
 * POST /api/phone/playback/stop
 * 
 * Stop playback on Phone 2
 * Triggered when phone is hung up
 */
export async function POST() {
  try {
    const session = PhoneSessionManager.getSession(2);

    if (!session) {
      return NextResponse.json(
        { error: 'No active phone session' },
        { status: 400 }
      );
    }

    const duration = PhoneSessionManager.getSessionDuration(2);

    console.log(`[Phone Playback] Session ended after ${duration}s`);

    return NextResponse.json({
      sessionId: session.sessionId,
      duration,
    });

  } catch (error) {
    console.error('Error stopping phone playback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
