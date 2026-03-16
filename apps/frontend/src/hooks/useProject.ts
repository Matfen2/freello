import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Project } from '../lib/types';

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<Project>(`/v1/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => setError('Projet introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
}