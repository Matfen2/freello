import { useState, useCallback, useEffect } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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

function findColumnOfTask(columns: KanbanColumns, taskId: string): TaskStatus | null {
  for (const status of STATUSES) {
    if (columns[status].some(t => t.id === taskId)) return status;
  }
  return null;
}

export function useKanban(tasks: Task[], refetch: () => void) {
  const [columns, setColumns] = useState<KanbanColumns>(() => buildColumns(tasks));
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Resync quand tasks change (après refetch), sauf pendant un drag
  useEffect(() => {
    if (!isDragging) {
      setColumns(buildColumns(tasks));
    }
  }, [tasks, isDragging]);

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    setIsDragging(true);
    const all = Object.values(columns).flat();
    setActiveTask(all.find(t => t.id === active.id) ?? null);
  }, [columns]);

  // ── onDragOver : déplace visuellement la card pendant le drag ──────────
  const onDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id as string;

    const activeCol = findColumnOfTask(columns, activeId);
    if (!activeCol) return;

    // Colonne cible : soit l'overId EST un statut, soit c'est une task dont on cherche la colonne
    let overCol: TaskStatus | null = null;
    if (STATUSES.includes(overId as TaskStatus)) {
      overCol = overId as TaskStatus;
    } else {
      overCol = findColumnOfTask(columns, overId);
    }

    if (!overCol || activeCol === overCol) return;

    setColumns(prev => {
      const activeTask = prev[activeCol].find(t => t.id === activeId);
      if (!activeTask) return prev;

      const overIndex = prev[overCol as TaskStatus].findIndex(t => t.id === overId);
      const insertAt  = overIndex >= 0 ? overIndex : prev[overCol as TaskStatus].length;

      return {
        ...prev,
        [activeCol]: prev[activeCol].filter(t => t.id !== activeId),
        [overCol as TaskStatus]: [
          ...prev[overCol as TaskStatus].slice(0, insertAt),
          { ...activeTask, status: overCol as TaskStatus },
          ...prev[overCol as TaskStatus].slice(insertAt),
        ],
      };
    });
  }, [columns]);

  // ── onDragEnd : persiste le nouveau statut ─────────────────────────────
  const onDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setIsDragging(false);

    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id as string;

    // Après onDragOver les colonnes sont déjà à jour — on cherche le nouveau statut
    const newCol = findColumnOfTask(columns, activeId);
    if (!newCol) return;

    // Réordonne dans la même colonne si over est une task
    if (!STATUSES.includes(overId as TaskStatus)) {
      const overCol = findColumnOfTask(columns, overId);
      if (overCol === newCol) {
        const oldIndex = columns[newCol].findIndex(t => t.id === activeId);
        const newIndex = columns[newCol].findIndex(t => t.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          setColumns(prev => ({
            ...prev,
            [newCol]: arrayMove(prev[newCol], oldIndex, newIndex),
          }));
        }
      }
    }

    // Cherche l'ancien statut dans les tasks d'origine pour savoir si ça a changé
    const originalTask = tasks.find(t => t.id === activeId);
    if (!originalTask || originalTask.status === newCol) return;

    // Persiste via API
    try {
      await api.patch(`/v1/tasks/${activeId}`, { status: newCol });
      refetch();
    } catch {
      // Rollback — remet les colonnes dans l'état original
      setColumns(buildColumns(tasks));
    }
  }, [columns, tasks, refetch]);

  return { columns, activeTask, onDragStart, onDragOver, onDragEnd };
}