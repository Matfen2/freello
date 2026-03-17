import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Task, TaskStatus, PaginatedResponse } from '../lib/types';

interface UseTasksOptions {
  projectId: string;
  status?: TaskStatus;
  page?: number;
  limit?: number;
}

export function useTasks({
  projectId,
  status,
  page = 1,
  limit = 20,
}: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState({ total: 0, page, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<Task>>('/v1/tasks', {
        params: {
          ...(projectId ? { projectId } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
          sort: 'createdAt',
          order: 'desc',
        },
      });
      setTasks(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Impossible de charger les tâches.');
    } finally {
      setLoading(false);
    }
  }, [projectId, status, page, limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, meta, loading, error, refetch: fetchTasks };
}