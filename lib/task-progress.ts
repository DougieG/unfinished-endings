/**
 * Task Progress Tracking System
 * Tracks long-running operations like transcription and crankie generation
 */

export type TaskStatus = 'queued' | 'transcribing' | 'generating_beats' | 'generating_images' | 'completed' | 'error';

export interface TaskProgress {
  taskId: string;
  storyId: string;
  status: TaskStatus;
  progress: number; // 0-100
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// In-memory storage for task progress (consider Redis for production)
const taskProgress = new Map<string, TaskProgress>();

export function createTask(storyId: string): string {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  taskProgress.set(taskId, {
    taskId,
    storyId,
    status: 'queued',
    progress: 0,
    currentStep: 'Queued',
    totalSteps: 10, // Approximate: transcribe, beats, N images
    currentStepIndex: 0,
    startedAt: new Date().toISOString(),
  });
  
  return taskId;
}

export function updateTaskProgress(
  taskId: string,
  updates: Partial<TaskProgress>
): void {
  const task = taskProgress.get(taskId);
  if (!task) return;
  
  taskProgress.set(taskId, {
    ...task,
    ...updates,
    progress: updates.progress ?? task.progress,
  });
}

export function getTaskProgress(taskId: string): TaskProgress | null {
  return taskProgress.get(taskId) || null;
}

export function getAllTasks(): TaskProgress[] {
  return Array.from(taskProgress.values());
}

export function getActiveTasksForStory(storyId: string): TaskProgress[] {
  return Array.from(taskProgress.values()).filter(
    task => task.storyId === storyId && task.status !== 'completed' && task.status !== 'error'
  );
}

export function completeTask(taskId: string, error?: string): void {
  const task = taskProgress.get(taskId);
  if (!task) return;
  
  taskProgress.set(taskId, {
    ...task,
    status: error ? 'error' : 'completed',
    progress: error ? task.progress : 100,
    completedAt: new Date().toISOString(),
    error,
  });
  
  // Clean up completed tasks after 5 minutes
  setTimeout(() => {
    taskProgress.delete(taskId);
  }, 5 * 60 * 1000);
}

export function calculateProgress(
  currentStepIndex: number,
  totalSteps: number,
  stepProgress: number = 100
): number {
  const stepWeight = 100 / totalSteps;
  return Math.min(100, Math.round(currentStepIndex * stepWeight + (stepProgress / 100) * stepWeight));
}
