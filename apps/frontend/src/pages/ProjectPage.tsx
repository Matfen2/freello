import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { useTasks } from '../hooks/useTasks';
import { TaskRow } from '../components/TaskRow';
import { TaskModal } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import type { Task, TaskStatus } from '../lib/types';
import { api } from '../lib/api';

const STATUS_FILTERS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'todo', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
];

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { project, loading: projectLoading } = useProject(id!);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { tasks, meta, loading: tasksLoading, error, refetch } = useTasks({
    projectId: id!,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 20,
  });

  // Modal état
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal.task) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/tasks/${deleteModal.task.id}`);
      setDeleteModal({ open: false });
      refetch();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Projets
        </button>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {projectLoading ? '…' : (project?.name ?? 'Projet')}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {projectLoading ? (
              <span className="block w-48 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : project?.name}
          </h1>
          {project?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {project.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setTaskModal({ open: true, task: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm flex-shrink-0"
        >
          <span className="text-lg leading-none">+</span>
          Nouvelle tâche
        </button>
      </div>

      {/* Filtres statut */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {meta.total} tâche{meta.total > 1 ? 's' : ''}
        </span>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Liste */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {tasksLoading && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-16 h-5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!tasksLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className="text-3xl mb-3">✅</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {statusFilter === 'all' ? 'Aucune tâche' : 'Aucune tâche dans ce statut'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {statusFilter === 'all' && 'Créez votre première tâche pour démarrer.'}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setTaskModal({ open: true, task: null })}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                Créer une tâche
              </button>
            )}
          </div>
        )}

        {!tasksLoading && tasks.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={t => setTaskModal({ open: true, task: t })}
                onDelete={t => setDeleteModal({ open: true, task: t })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            →
          </button>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        open={taskModal.open}
        projectId={id!}
        task={taskModal.task}
        onClose={() => setTaskModal({ open: false })}
        onSaved={refetch}
      />
      <DeleteConfirmModal
        open={deleteModal.open}
        title={deleteModal.task?.title ?? ''}
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ open: false })}
        loading={deleteLoading}
      />
    </div>
  );
}