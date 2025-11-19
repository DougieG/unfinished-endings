// Phone configuration constants
// Used by recording/playback stations to map hardware events

export const PHONE_CONFIG = {
  // Audio device names (partial match)
  // Update these after checking /debug/devices on the actual iPads
  phone1DeviceName: 'USB Audio Device', // Recording phone
  phone2DeviceName: 'USB Audio Device', // Playback phone

  // Key codes for Recording Station (Phone 1)
  // Update these after checking /debug/keys with your hardware
  recording: {
    offHook: ['KeyR', 'Digit1'], // Keys that trigger "pickup"
    onHook: ['KeyH', 'Digit2'],  // Keys that trigger "hangup"
    // Optional extra buttons
    consentYes: ['KeyY'],
    consentNo: ['KeyN'],
  },

  // Key codes for Playback Station (Phone 2)
  playback: {
    offHook: ['KeyP', 'Digit3'], // Keys that trigger "pickup"
    onHook: ['KeyO', 'Digit4'],  // Keys that trigger "hangup"
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
