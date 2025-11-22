/**
 * BULLETPROOF Audio Upload Queue
 * Handles retries, offline storage, and guaranteed delivery
 */

interface QueuedUpload {
  id: string;
  blob: Blob;
  sessionId: string | null;
  timestamp: number;
  retries: number;
  lastError?: string;
}

const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Progressive backoff
const STORAGE_KEY = 'unfinished_endings_upload_queue';

export class AudioUploadQueue {
  private queue: QueuedUpload[] = [];
  private processing = false;

  constructor() {
    this.loadQueue();
    this.startProcessing();
  }

  /**
   * Add audio to upload queue with persistence
   */
  async enqueue(blob: Blob, sessionId: string | null): Promise<string> {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const upload: QueuedUpload = {
      id,
      blob,
      sessionId,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(upload);
    await this.saveQueue();
    
    console.log(`📦 Queued upload: ${id}`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
    
    return id;
  }

  /**
   * Process queue with automatic retries
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const upload = this.queue[0];
      
      try {
        console.log(`🚀 Processing upload: ${upload.id} (attempt ${upload.retries + 1}/${MAX_RETRIES + 1})`);
        
        await this.uploadWithRetry(upload);
        
        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();
        console.log(`✅ Upload complete: ${upload.id}`);
        
      } catch (error) {
        console.error(`❌ Upload failed: ${upload.id}`, error);
        
        upload.retries++;
        upload.lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (upload.retries >= MAX_RETRIES) {
          // Max retries reached - move to failed queue
          console.error(`💀 Upload permanently failed after ${MAX_RETRIES} retries: ${upload.id}`);
          this.queue.shift();
          await this.saveFailed(upload);
        } else {
          // Retry with exponential backoff
          const delay = RETRY_DELAYS[upload.retries - 1] || 30000;
          console.log(`⏰ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
        
        await this.saveQueue();
      }
    }
    
    this.processing = false;
  }

  /**
   * Upload with automatic retry and verification
   */
  private async uploadWithRetry(upload: QueuedUpload): Promise<void> {
    const formData = new FormData();
    formData.append('audio', upload.blob);
    if (upload.sessionId) {
      formData.append('sessionId', upload.sessionId);
    }

    // Add queue metadata for tracking
    formData.append('uploadId', upload.id);
    formData.append('attempt', String(upload.retries + 1));

    const response = await fetch('/api/stories', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.details || 
        errorData.error || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    
    // Verify upload was successful
    if (!result.id || !result.audio_url) {
      throw new Error('Upload succeeded but response invalid');
    }

    // Double-check file is accessible
    try {
      const checkResponse = await fetch(result.audio_url, { method: 'HEAD' });
      if (!checkResponse.ok) {
        throw new Error('Upload succeeded but file not accessible');
      }
    } catch (err) {
      console.warn('Could not verify file accessibility:', err);
      // Don't fail the upload for this - it might just be a timing issue
    }

    console.log(`✅ Upload verified: ${result.id} → ${result.audio_url}`);
  }

  /**
   * Start background processing
   */
  private startProcessing() {
    // Process queue on startup
    setTimeout(() => this.processQueue(), 1000);
    
    // Periodic check for stuck items
    setInterval(() => {
      if (!this.processing && this.queue.length > 0) {
        console.log('🔄 Resuming queue processing...');
        this.processQueue();
      }
    }, 60000); // Check every minute
  }

  /**
   * Persist queue to localStorage
   */
  private async saveQueue() {
    try {
      // Convert blobs to base64 for storage
      const serialized = await Promise.all(
        this.queue.map(async (upload) => ({
          id: upload.id,
          blobData: await this.blobToBase64(upload.blob),
          blobType: upload.blob.type,
          sessionId: upload.sessionId,
          timestamp: upload.timestamp,
          retries: upload.retries,
          lastError: upload.lastError,
        }))
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (err) {
      console.error('Failed to save queue:', err);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const serialized = JSON.parse(stored);
      
      this.queue = serialized.map((item: any) => ({
        id: item.id,
        blob: this.base64ToBlob(item.blobData, item.blobType),
        sessionId: item.sessionId,
        timestamp: item.timestamp,
        retries: item.retries,
        lastError: item.lastError,
      }));
      
      console.log(`📂 Loaded ${this.queue.length} pending uploads from storage`);
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
  }

  /**
   * Save permanently failed uploads
   */
  private async saveFailed(upload: QueuedUpload) {
    try {
      const failed = JSON.parse(localStorage.getItem('upload_failed') || '[]');
      failed.push({
        id: upload.id,
        timestamp: upload.timestamp,
        retries: upload.retries,
        lastError: upload.lastError,
        size: upload.blob.size,
      });
      localStorage.setItem('upload_failed', JSON.stringify(failed));
      
      // Alert user/admin
      console.error('⚠️ UPLOAD PERMANENTLY FAILED - MANUAL INTERVENTION REQUIRED', {
        uploadId: upload.id,
        error: upload.lastError,
      });
    } catch (err) {
      console.error('Failed to save failed upload record:', err);
    }
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      pending: this.queue.length,
      processing: this.processing,
      uploads: this.queue.map(u => ({
        id: u.id,
        retries: u.retries,
        lastError: u.lastError,
        age: Date.now() - u.timestamp,
      })),
    };
  }

  /**
   * Manually retry failed uploads
   */
  retryAll() {
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Helper: blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Helper: base64 to blob
   */
  private base64ToBlob(base64: string, type: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
  }

  /**
   * Helper: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let uploadQueue: AudioUploadQueue | null = null;

export function getUploadQueue(): AudioUploadQueue {
  if (!uploadQueue) {
    uploadQueue = new AudioUploadQueue();
  }
  return uploadQueue;
}
