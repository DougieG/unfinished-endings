'use client';

import { useState, useEffect } from 'react';

interface TaskProgress {
  taskId: string;
  storyId: string;
  status: string;
  progress: number;
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  error?: string;
}

interface TaskProgressBarProps {
  taskId: string;
  onComplete?: () => void;
}

export function TaskProgressBar({ taskId, onComplete }: TaskProgressBarProps) {
  const [task, setTask] = useState<TaskProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    // Poll for progress updates every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/task-progress?taskId=${taskId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        
        const data = await response.json();
        setTask(data.task);

        // Stop polling when complete or error
        if (data.task.status === 'completed' || data.task.status === 'error') {
          clearInterval(interval);
          if (data.task.status === 'completed' && onComplete) {
            setTimeout(onComplete, 1000); // Small delay before callback
          }
        }
      } catch (err) {
        console.error('Error fetching task progress:', err);
        setError('Failed to fetch progress');
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, onComplete]);

  if (error) {
    return (
      <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">⚠️ {error}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">Loading progress...</p>
      </div>
    );
  }

  const getStatusColor = () => {
    if (task.status === 'error') return 'bg-red-500';
    if (task.status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (task.status === 'error') return '❌';
    if (task.status === 'completed') return '✅';
    return '⏳';
  };

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium text-gray-900">
            {task.currentStep}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-700">
          {task.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${getStatusColor()} transition-all duration-500 ease-out`}
          style={{ width: `${task.progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Step {task.currentStepIndex + 1} of {task.totalSteps}
        </span>
        {task.status === 'error' && task.error && (
          <span className="text-red-600 font-medium">{task.error}</span>
        )}
        {task.status === 'completed' && (
          <span className="text-green-600 font-medium">Complete!</span>
        )}
      </div>
    </div>
  );
}

interface TaskProgressListProps {
  storyId?: string;
}

export function TaskProgressList({ storyId }: TaskProgressListProps) {
  const [tasks, setTasks] = useState<TaskProgress[]>([]);

  useEffect(() => {
    // Poll for all tasks every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/task-progress');
        if (!response.ok) return;
        
        const data = await response.json();
        let filteredTasks = data.tasks || [];
        
        // Filter by storyId if provided
        if (storyId) {
          filteredTasks = filteredTasks.filter((t: TaskProgress) => t.storyId === storyId);
        }
        
        // Only show active tasks
        filteredTasks = filteredTasks.filter(
          (t: TaskProgress) => t.status !== 'completed' && t.status !== 'error'
        );
        
        setTasks(filteredTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [storyId]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 space-y-2 z-50">
      {tasks.map((task) => (
        <TaskProgressBar key={task.taskId} taskId={task.taskId} />
      ))}
    </div>
  );
}
