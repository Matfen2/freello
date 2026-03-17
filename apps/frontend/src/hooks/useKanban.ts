import { useState, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { api } from '../lib/api';
import type { Task, TaskStatus } from '../lib/types';

export type KanbanColumns = Record<TaskStatus, Task[]>;

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export function buildColumns(tasks: Task[]): KanbanColumns {
  const cols: KanbanColumns = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) {
    const status = STATUSES.includes(task.status) ? task.status : 'todo';
    cols[status].push(task);
  }
  return cols;
}

export function useKanban(tasks: Task[], refetch: () => void) {
  const [columns, setColumns] = useState<KanbanColumns>(() => buildColumns(tasks));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync columns when tasks prop changes
  const syncColumns = useCallback((newTasks: Task[]) => {
    setColumns(buildColumns(newTasks));
  }, []);

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    const all = Object.values(columns).flat();
    const task = all.find(t => t.id === active.id) ?? null;
    setActiveTask(task);
  }, [columns]);

  const onDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find source column
    let sourceStatus: TaskStatus | null = null;
    let draggedTask: Task | null = null;

    for (const status of STATUSES) {
      const found = columns[status].find(t => t.id === taskId);
      if (found) {
        sourceStatus = status;
        draggedTask = found;
        break;
      }
    }

    if (!sourceStatus || !draggedTask) return;

    // Determine target column — overId is either a column status or a task id
    let targetStatus: TaskStatus = sourceStatus;
    if (STATUSES.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      for (const status of STATUSES) {
        if (columns[status].some(t => t.id === overId)) {
          targetStatus = status;
          break;
        }
      }
    }

    if (targetStatus === sourceStatus) return;

    // Optimistic update
    setColumns(prev => {
      const next = { ...prev };
      next[sourceStatus!] = prev[sourceStatus!].filter(t => t.id !== taskId);
      next[targetStatus] = [...prev[targetStatus], { ...draggedTask!, status: targetStatus }];
      return next;
    });

    // Persist to API
    try {
      await api.patch(`/v1/tasks/${taskId}`, { status: targetStatus });
      refetch();
    } catch {
      // Rollback on error
      setColumns(prev => {
        const next = { ...prev };
        next[targetStatus] = prev[targetStatus].filter(t => t.id !== taskId);
        next[sourceStatus!] = [...prev[sourceStatus!], draggedTask!];
        return next;
      });
    }
  }, [columns, refetch]);

  return { columns, syncColumns, activeTask, onDragStart, onDragEnd };
}