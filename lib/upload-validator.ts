/**
 * BULLETPROOF Upload Validation
 * Pre-flight checks to catch issues before upload
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AudioValidation extends ValidationResult {
  fileSize: number;
  duration?: number;
  format: string;
}

/**
 * Validate audio blob before upload
 */
export async function validateAudioBlob(blob: Blob): Promise<AudioValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  const MIN_SIZE = 1000; // 1KB minimum
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB maximum
  const WARN_SIZE = 10 * 1024 * 1024; // 10MB warning threshold

  if (blob.size < MIN_SIZE) {
    errors.push(`File too small (${blob.size} bytes). Minimum ${MIN_SIZE} bytes.`);
  }

  if (blob.size > MAX_SIZE) {
    errors.push(`File too large (${Math.round(blob.size / 1024 / 1024)}MB). Maximum ${MAX_SIZE / 1024 / 1024}MB.`);
  }

  if (blob.size > WARN_SIZE) {
    warnings.push(`Large file (${Math.round(blob.size / 1024 / 1024)}MB) may take time to upload.`);
  }

  // Check MIME type
  const validTypes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
  if (!validTypes.includes(blob.type)) {
    errors.push(`Invalid audio format: ${blob.type}. Supported: ${validTypes.join(', ')}`);
  }

  // Try to get duration
  let duration: number | undefined;
  try {
    duration = await getAudioDuration(blob);
    
    if (duration && duration < 1) {
      warnings.push('Recording is very short (< 1 second)');
    }
    
    if (duration && duration > 180) {
      warnings.push(`Recording is long (${Math.round(duration)}s). May take time to process.`);
    }
  } catch (err) {
    warnings.push('Could not determine audio duration');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fileSize: blob.size,
    duration,
    format: blob.type,
  };
}

/**
 * Get audio duration from blob
 */
async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener('error', (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });

    audio.src = url;
  });
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for online status
 */
export async function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  if (navigator.onLine) return true;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeoutMs);

    const onlineHandler = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Test API endpoint health
 */
export async function testAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/stories', {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (err) {
    console.error('API health check failed:', err);
    return false;
  }
}

/**
 * Test Supabase storage accessibility
 */
export async function testStorageHealth(testUrl?: string): Promise<boolean> {
  if (!testUrl) return true; // Skip if no test URL provided

  try {
    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (err) {
    console.error('Storage health check failed:', err);
    return false;
  }
}

/**
 * Comprehensive pre-upload health check
 */
export async function performHealthCheck(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check online status
  if (!isOnline()) {
    issues.push('No internet connection');
  }

  // Check API health
  const apiHealthy = await testAPIHealth();
  if (!apiHealthy) {
    issues.push('API endpoint not responding');
  }

  // Check localStorage availability
  try {
    localStorage.setItem('health_check', 'test');
    localStorage.removeItem('health_check');
  } catch (err) {
    issues.push('Local storage not available');
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}
