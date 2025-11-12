import crypto from 'crypto';

/**
 * Twilio webhook signature verification
 */
export function verifyTwilioSignature(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: Record<string, any>
): boolean {
  // Sort params and create data string
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  // Create HMAC signature
  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(Buffer.from(data, 'utf-8'));
  const sig = hmac.digest('base64');

  return sig === twilioSignature;
}

/**
 * Generate TwiML response
 */
export function generateTwiML(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`;
}

/**
 * TwiML helpers
 */
export const TwiML = {
  say(text: string, voice: string = 'alice'): string {
    return `<Say voice="${voice}">${text}</Say>`;
  },

  gather(options: {
    action?: string;
    numDigits?: number;
    timeout?: number;
    children: string;
  }): string {
    const attrs = [];
    if (options.action) attrs.push(`action="${options.action}"`);
    if (options.numDigits) attrs.push(`numDigits="${options.numDigits}"`);
    if (options.timeout) attrs.push(`timeout="${options.timeout}"`);

    return `<Gather ${attrs.join(' ')}>${options.children}</Gather>`;
  },

  record(options: {
    maxLength?: number;
    playBeep?: boolean;
    recordingStatusCallback?: string;
    transcribe?: boolean;
  }): string {
    const attrs = [];
    if (options.maxLength) attrs.push(`maxLength="${options.maxLength}"`);
    if (options.playBeep !== undefined) attrs.push(`playBeep="${options.playBeep}"`);
    if (options.recordingStatusCallback) {
      attrs.push(`recordingStatusCallback="${options.recordingStatusCallback}"`);
    }
    if (options.transcribe !== undefined) attrs.push(`transcribe="${options.transcribe}"`);

    return `<Record ${attrs.join(' ')}/>`;
  },

  play(url: string): string {
    return `<Play>${url}</Play>`;
  },

  pause(length: number = 1): string {
    return `<Pause length="${length}"/>`;
  },

  hangup(): string {
    return '<Hangup/>';
  },

  redirect(url: string): string {
    return `<Redirect>${url}</Redirect>`;
  },
};

/**
 * Mock telephony mode checker
 */
export function isMockMode(): boolean {
  return !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN;
}
