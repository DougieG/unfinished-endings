// Phone configuration constants
// Used by recording/playback stations to map hardware events

export const PHONE_CONFIG = {
  // Audio device names (partial match)
  // Both iPads use Native Union POP Phone
  phone1DeviceName: 'Native Union POP Phone', // Recording phone
  phone2DeviceName: 'Native Union POP Phone', // Playback phone

  // Key codes for Recording Station (Phone 1)
  // Tested: KeyC from first device
  recording: {
    offHook: ['KeyC'], // Keys that trigger "pickup" (button released)
    onHook: ['KeyC'],  // Keys that trigger "hangup" (button pressed)
    // Optional extra buttons
    consentYes: ['KeyY'],
    consentNo: ['KeyN'],
  },

  // Key codes for Playback Station (Phone 2)
  // Same hardware = same key codes
  playback: {
    offHook: ['KeyC'], // Keys that trigger "pickup" (button released)
    onHook: ['KeyC'],  // Keys that trigger "hangup" (button pressed)
    // Optional navigation
    next: ['ArrowRight', 'KeyN'],
    repeat: ['ArrowLeft', 'KeyR'],
  },

  // Timings (ms)
  timeouts: {
    recordingMax: 300000, // 5 minutes
    idleReset: 30000,     // Reset to idle if inactive
  }
};
