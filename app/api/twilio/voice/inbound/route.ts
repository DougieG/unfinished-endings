import { NextRequest, NextResponse } from 'next/server';
import { generateTwiML, TwiML, verifyTwilioSignature } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio signature in production
    if (process.env.TWILIO_AUTH_TOKEN) {
      const signature = request.headers.get('x-twilio-signature') || '';
      const url = process.env.NEXT_PUBLIC_APP_URL + '/api/twilio/voice/inbound';
      const params = Object.fromEntries(await request.formData());

      const isValid = verifyTwilioSignature(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        params
      );

      if (!isValid) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const formData = await request.formData();
    const digits = formData.get('Digits')?.toString();

    let twiml = '';

    if (digits === '1') {
      // User pressed 1 - start recording
      twiml = generateTwiML(
        TwiML.say(
          'When you hear the tone, speak your tale. You have two minutes and forty-five seconds.',
          'Polly.Joanna'
        ) +
        TwiML.record({
          maxLength: 165,
          playBeep: true,
          recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/recording/complete`,
        }) +
        TwiML.say('Thank you. Your tale has been added to our archive.', 'Polly.Joanna') +
        TwiML.hangup()
      );
    } else {
      // Initial greeting
      twiml = generateTwiML(
        TwiML.gather({
          action: '/api/twilio/voice/inbound',
          numDigits: 1,
          timeout: 10,
          children:
            TwiML.say(
              'Welcome to Unfinished Endings. Press 1 to add your tale to our archive. By pressing 1, you consent to others witnessing it.',
              'Polly.Joanna'
            ) +
            TwiML.pause(2),
        }) +
        TwiML.say('We did not receive your input. Goodbye.', 'Polly.Joanna') +
        TwiML.hangup()
      );
    }

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error in Twilio inbound handler:', error);
    const errorTwiml = generateTwiML(
      TwiML.say('We apologize. An error occurred. Please try again later.', 'Polly.Joanna') +
      TwiML.hangup()
    );
    return new NextResponse(errorTwiml, {
      status: 500,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
