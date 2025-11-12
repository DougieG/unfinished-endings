import { NextRequest, NextResponse } from 'next/server';
import { PhoneSessionManager, type HookEvent } from '@/lib/phone-audio';

/**
 * POST /api/phone/hook
 * 
 * Webhook endpoint for phone hook state changes
 * Called by Raspberry Pi GPIO monitor or USB phone adapter
 * 
 * Body: { phone: 1 | 2, state: 'on-hook' | 'off-hook' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, state } = body;

    // Validate input
    if (![1, 2].includes(phone) || !['on-hook', 'off-hook'].includes(state)) {
      return NextResponse.json(
        { error: 'Invalid hook event' },
        { status: 400 }
      );
    }

    const event: HookEvent = {
      phone,
      state,
      timestamp: Date.now(),
    };

    // Log event
    console.log(`[Phone ${phone}] ${state} at ${new Date().toISOString()}`);

    // Handle the hook event
    const session = await PhoneSessionManager.handleHookEvent(event);

    if (state === 'off-hook') {
      // Phone picked up
      if (phone === 1) {
        // Recording phone - trigger recording start via WebSocket or polling
        console.log(`[Phone 1] Starting recording session: ${session?.sessionId}`);
        return NextResponse.json({
          action: 'start_recording',
          session,
        });
      } else {
        // Playback phone - trigger random story playback
        console.log(`[Phone 2] Starting playback session: ${session?.sessionId}`);
        return NextResponse.json({
          action: 'start_playback',
          session,
        });
      }
    } else {
      // Phone hung up
      if (phone === 1) {
        console.log(`[Phone 1] Recording session ended: ${session?.sessionId}`);
        return NextResponse.json({
          action: 'stop_recording',
          session,
          duration: PhoneSessionManager.getSessionDuration(phone),
        });
      } else {
        console.log(`[Phone 2] Playback session ended: ${session?.sessionId}`);
        return NextResponse.json({
          action: 'stop_playback',
          session,
        });
      }
    }

  } catch (error) {
    console.error('Error handling hook event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/phone/hook
 * 
 * Get current hook states (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    phone1: PhoneSessionManager.getSession(1),
    phone2: PhoneSessionManager.getSession(2),
  });
}
