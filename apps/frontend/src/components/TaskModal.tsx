import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { Task, TaskStatus } from '../lib/types';

interface TaskModalProps {
  open: boolean;
  projectId: string;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done',        label: 'Terminé' },
];

export function TaskModal({ open, projectId, task, defaultStatus, onClose, onSaved }: TaskModalProps) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus]         = useState<TaskStatus>('todo');
  const [estimation, setEstimation] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!task;

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '');
      setDescription(task?.description ?? '');
      // defaultStatus pré-sélectionne le statut quand on clique "+" depuis une colonne
      setStatus(task?.status ?? defaultStatus ?? 'todo');
      setEstimation(task?.estimation?.toString() ?? '');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, task, defaultStatus]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      title,
      description: description || undefined,
      status,
      estimation: estimation ? parseInt(estimation, 10) : undefined,
      projectId,
    };
    try {
      if (isEdit) {
        await api.patch(`/v1/tasks/${task.id}`, payload);
      } else {
        await api.post('/v1/tasks', payload);
      }
      onSaved();
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">
          {isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Ex : Implémenter la page de login"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimation (pts)
              </label>
              <input
                type="number"
                value={estimation}
                onChange={e => setEstimation(e.target.value)}
                min={0}
                max={999}
                placeholder="—"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {loading ? 'Sauvegarde…' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}