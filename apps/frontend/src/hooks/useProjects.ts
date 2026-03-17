import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Project, PaginatedResponse } from '../lib/types';

interface UseProjectsOptions {
  page?: number;
  limit?: number;
}

export function useProjects({ page = 1, limit = 12 }: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState({ total: 0, page, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<Project>>('/v1/projects', {
        params: { page, limit, sort: 'createdAt', order: 'desc' },
      });
      setProjects(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Impossible de charger les projets.');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, meta, loading, error, refetch: fetchProjects };
}