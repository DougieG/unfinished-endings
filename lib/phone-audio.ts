/**
 * Physical Phone Audio Management
 * Handles audio streams from traditional wired phones
 */

export interface PhoneDevice {
  id: string;
  name: string;
  type: 'recording' | 'playback';
  deviceId?: string; // Browser MediaDevices API ID
}

export interface PhoneAudioConfig {
  phone1DeviceName: string; // Recording phone
  phone2DeviceName: string; // Playback phone
  sampleRate?: number;
  channelCount?: number;
}

/**
 * Phone Audio Manager
 * Manages audio I/O for physical phones
 */
export class PhoneAudioManager {
  private config: PhoneAudioConfig;
  private recordingStream: MediaStream | null = null;
  private playbackContext: AudioContext | null = null;
  private playbackSource: AudioBufferSourceNode | null = null;

  constructor(config: PhoneAudioConfig) {
    this.config = {
      ...config,
      sampleRate: config.sampleRate || 48000,
      channelCount: config.channelCount || 1, // Mono for phone audio
    };
  }

  /**
   * List available audio devices
   */
  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput');
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }

  /**
   * Find phone device by name
   */
  async findPhoneDevice(name: string, kind: 'audioinput' | 'audiooutput'): Promise<string | null> {
    const devices = await this.getAvailableDevices();
    const device = devices.find(d => 
      d.kind === kind && 
      d.label.toLowerCase().includes(name.toLowerCase())
    );
    return device?.deviceId || null;
  }

  /**
   * Start recording from Phone 1 (Recording Phone)
   */
  async startRecording(): Promise<MediaStream> {
    try {
      const deviceId = await this.findPhoneDevice(
        this.config.phone1DeviceName, 
        'audioinput'
      );

      if (!deviceId) {
        throw new Error(`Recording phone "${this.config.phone1DeviceName}" not found`);
      }

      this.recordingStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false, // Phone already handles this
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
        }
      });

      return this.recordingStream;
    } catch (error) {
      console.error('Error starting phone recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and clean up
   */
  stopRecording(): void {
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop());
      this.recordingStream = null;
    }
  }

  /**
   * Play audio through Phone 2 (Playback Phone)
   */
  async startPlayback(audioUrl: string): Promise<void> {
    try {
      const deviceId = await this.findPhoneDevice(
        this.config.phone2DeviceName,
        'audiooutput'
      );

      if (!deviceId) {
        throw new Error(`Playback phone "${this.config.phone2DeviceName}" not found`);
      }

      // Create audio context if needed
      if (!this.playbackContext) {
        this.playbackContext = new AudioContext({
          sampleRate: this.config.sampleRate,
        });
      }

      // Fetch and decode audio
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.playbackContext.decodeAudioData(arrayBuffer);

      // Create source node
      this.playbackSource = this.playbackContext.createBufferSource();
      this.playbackSource.buffer = audioBuffer;

      // Connect to destination (phone output)
      this.playbackSource.connect(this.playbackContext.destination);

      // Set output device (requires Web Audio API setSinkId support)
      if ('setSinkId' in this.playbackContext.destination) {
        await (this.playbackContext.destination as any).setSinkId(deviceId);
      }

      // Start playback
      this.playbackSource.start(0);

      // Clean up when finished
      this.playbackSource.onended = () => {
        this.stopPlayback();
      };

    } catch (error) {
      console.error('Error starting phone playback:', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    if (this.playbackSource) {
      try {
        this.playbackSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.playbackSource = null;
    }
  }

  /**
   * Play a tone or prompt through phone
   */
  async playTone(frequency: number, duration: number, phone: 'recording' | 'playback'): Promise<void> {
    const deviceName = phone === 'recording' 
      ? this.config.phone1DeviceName 
      : this.config.phone2DeviceName;

    const deviceId = await this.findPhoneDevice(
      deviceName,
      'audiooutput'
    );

    if (!deviceId) return;

    const context = new AudioContext({ sampleRate: this.config.sampleRate });
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Set output device
    if ('setSinkId' in context.destination) {
      await (context.destination as any).setSinkId(deviceId);
    }

    // Fade in/out for smooth tone
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);

    return new Promise(resolve => {
      oscillator.onended = () => {
        context.close();
        resolve();
      };
    });
  }

  /**
   * Play dial tone (350Hz + 440Hz)
   */
  async playDialTone(duration: number = 2, phone: 'recording' | 'playback' = 'recording'): Promise<void> {
    const deviceName = phone === 'recording' 
      ? this.config.phone1DeviceName 
      : this.config.phone2DeviceName;

    const deviceId = await this.findPhoneDevice(deviceName, 'audiooutput');
    if (!deviceId) return;

    const context = new AudioContext({ sampleRate: this.config.sampleRate });
    
    // Classic US dial tone: 350Hz + 440Hz
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gainNode = context.createGain();

    osc1.frequency.value = 350;
    osc2.frequency.value = 440;

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(context.destination);

    if ('setSinkId' in context.destination) {
      await (context.destination as any).setSinkId(deviceId);
    }

    gainNode.gain.value = 0.2;

    osc1.start(context.currentTime);
    osc2.start(context.currentTime);
    osc1.stop(context.currentTime + duration);
    osc2.stop(context.currentTime + duration);

    return new Promise(resolve => {
      osc1.onended = () => {
        context.close();
        resolve();
      };
    });
  }

  /**
   * Play beep (1000Hz, 0.2s)
   */
  async playBeep(phone: 'recording' | 'playback' = 'recording'): Promise<void> {
    return this.playTone(1000, 0.2, phone);
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopRecording();
    this.stopPlayback();
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
  }
}

/**
 * Server-side phone audio utilities (for API routes)
 */

export interface HookEvent {
  phone: 1 | 2;
  state: 'on-hook' | 'off-hook';
  timestamp: number;
}

export interface PhoneSession {
  phone: 1 | 2;
  sessionId: string;
  startTime: number;
  type: 'recording' | 'playback';
  storyId?: string;
}

// In-memory session tracking (use Redis in production)
const activeSessions = new Map<number, PhoneSession>();

export class PhoneSessionManager {
  /**
   * Handle hook state change
   */
  static async handleHookEvent(event: HookEvent): Promise<PhoneSession | null> {
    const { phone, state } = event;

    if (state === 'off-hook') {
      // Phone picked up - start new session
      return this.startSession(phone);
    } else {
      // Phone hung up - end session
      return this.endSession(phone);
    }
  }

  /**
   * Start new phone session
   */
  private static async startSession(phone: 1 | 2): Promise<PhoneSession> {
    const session: PhoneSession = {
      phone,
      sessionId: `phone${phone}-${Date.now()}`,
      startTime: Date.now(),
      type: phone === 1 ? 'recording' : 'playback',
    };

    activeSessions.set(phone, session);
    return session;
  }

  /**
   * End phone session
   */
  private static async endSession(phone: 1 | 2): Promise<PhoneSession | null> {
    const session = activeSessions.get(phone);
    if (session) {
      activeSessions.delete(phone);
    }
    return session || null;
  }

  /**
   * Get active session for phone
   */
  static getSession(phone: 1 | 2): PhoneSession | null {
    return activeSessions.get(phone) || null;
  }

  /**
   * Get session duration in seconds
   */
  static getSessionDuration(phone: 1 | 2): number {
    const session = activeSessions.get(phone);
    if (!session) return 0;
    return Math.floor((Date.now() - session.startTime) / 1000);
  }
}
