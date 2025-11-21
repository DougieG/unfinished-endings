import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, getTaskProgress } from '@/lib/task-progress';

/**
 * GET /api/admin/task-progress
 * Get all active tasks or specific task by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get specific task
      const task = getTaskProgress(taskId);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ task });
    }

    // Get all active tasks
    const tasks = getAllTasks();
    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Error fetching task progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
