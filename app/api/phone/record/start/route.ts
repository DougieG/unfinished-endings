import { NextRequest, NextResponse } from 'next/server';
import { PhoneSessionManager } from '@/lib/phone-audio';

/**
 * POST /api/phone/record/start
 * 
 * Start recording from Phone 1
 * Triggered when phone is picked up
 */
export async function POST(request: NextRequest) {
  try {
    const session = PhoneSessionManager.getSession(1);

    if (!session) {
      return NextResponse.json(
        { error: 'No active phone session' },
        { status: 400 }
      );
    }

    // Return session info for client to start MediaRecorder
    return NextResponse.json({
      sessionId: session.sessionId,
      phone: 1,
      maxDuration: 165, // 2:45 max
      instructions: 'Pick up the phone to record your story',
    });

  } catch (error) {
    console.error('Error starting phone recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
