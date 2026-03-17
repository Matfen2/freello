/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../hooks/useProject';
import { useTasks } from '../hooks/useTasks';
import { TaskRow } from '../components/TaskRow';
import { TaskModal } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { ViewToggle } from '../components/ViewToggle';
import type { Task, TaskStatus } from '../lib/types';
import { api } from '../lib/api';

const STATUS_FILTERS: { value: TaskStatus | 'all'; label: string; color: string }[] = [
  { value: 'all',         label: 'Toutes',   color: '' },
  { value: 'todo',        label: 'À faire',  color: 'bg-gray-400' },
  { value: 'in_progress', label: 'En cours', color: 'bg-amber-400' },
  { value: 'done',        label: 'Terminé',  color: 'bg-emerald-400' },
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
};

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [view, setView]               = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [page, setPage]               = useState(1);

  const [taskModal, setTaskModal]     = useState<{ open: boolean; task?: Task | null; defaultStatus?: TaskStatus }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedIds, setDeletedIds]   = useState<Set<string>>(new Set());

  const { project, loading: projectLoading } = useProject(id ?? '');

  const { tasks, meta, loading: tasksLoading, error, refetch } = useTasks({
    projectId: id ?? '',
    status: view === 'kanban' ? undefined : (statusFilter === 'all' ? undefined : statusFilter),
    page: view === 'kanban' ? 1 : page,
    limit: view === 'kanban' ? 200 : 20,
  });

  useEffect(() => { setPage(1); }, [view]);

  if (!id) return <Navigate to="/dashboard" replace />;

  const visibleTasks = tasks.filter(t => !deletedIds.has(t.id));

  const handleDelete = async () => {
    if (!deleteModal.task) return;
    const deletedId = deleteModal.task.id;
    setDeleteModal({ open: false });
    setDeletedIds(prev => new Set([...prev, deletedId]));
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/tasks/${deletedId}`);
      await refetch();
    } catch {
      setDeletedIds(prev => { const n = new Set(prev); n.delete(deletedId); return n; });
    } finally {
      setDeletedIds(new Set());
      setDeleteLoading(false);
    }
  };

  const openAddTask = (defaultStatus?: TaskStatus) =>
    setTaskModal({ open: true, task: null, defaultStatus });

  return (
    <div className="max-w-screen-2xl mx-auto w-full">

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2 text-sm mb-8"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          Projets
        </button>
        <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-900 dark:text-gray-100 font-semibold truncate max-w-xs">
          {projectLoading
            ? <span className="inline-block w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            : (project?.name ?? 'Projet')}
        </span>
      </motion.div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05 }}
        className="flex items-start justify-between gap-4 mb-8"
      >
        <div className="min-w-0">
          {projectLoading ? (
            <div className="space-y-2">
              <div className="w-56 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-80 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight truncate">
                {project?.name}
              </h1>
              {project?.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xl line-clamp-2">
                  {project.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <ViewToggle view={view} onChange={setView} />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openAddTask()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nouvelle tâche</span>
            <span className="sm:hidden">Tâche</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Views ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* KANBAN */}
        {view === 'kanban' && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tasksLoading ? (
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-72 flex-shrink-0 space-y-2">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <KanbanBoard
                tasks={tasks}
                refetch={refetch}
                onEdit={task => setTaskModal({ open: true, task })}
                onDelete={task => setDeleteModal({ open: true, task })}
                onAddTask={openAddTask}
              />
            )}
          </motion.div>
        )}

        {/* LIST */}
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Filters + count ─────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 mb-5 overflow-x-auto pb-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                {STATUS_FILTERS.map(f => (
                  <motion.button
                    key={f.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setStatusFilter(f.value); setPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      statusFilter === f.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {f.color && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        statusFilter === f.value ? 'bg-white' : f.color
                      }`} />
                    )}
                    {f.label}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {!tasksLoading && (
                  <motion.span
                    key={meta.total}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0"
                  >
                    {meta.total} tâche{meta.total > 1 ? 's' : ''}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Task list ───────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">

              {/* Skeleton */}
              {tasksLoading && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                      <div className="w-16 h-5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="w-8 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {!tasksLoading && visibleTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center px-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {statusFilter === 'all' ? 'Aucune tâche' : 'Aucune tâche dans ce statut'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    {statusFilter === 'all' ? 'Créez votre première tâche pour démarrer.' : ''}
                  </p>
                  {statusFilter === 'all' && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openAddTask()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                    >
                      Créer une tâche
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Rows */}
              {!tasksLoading && visibleTasks.length > 0 && (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-gray-100 dark:divide-gray-800"
                >
                  <AnimatePresence mode="popLayout">
                    {visibleTasks.map(task => (
                      <motion.div
                        key={task.id}
                        variants={rowVariants}
                        exit={{ opacity: 0, x: 16, transition: { duration: 0.15 } }}
                        layout
                      >
                        <TaskRow
                          task={task}
                          onEdit={t => setTaskModal({ open: true, task: t })}
                          onDelete={t => setDeleteModal({ open: true, task: t })}
                          onRefresh={refetch}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* ── Pagination ──────────────────────────────────────── */}
            <AnimatePresence>
              {meta.totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    aria-label="Page précédente"
                  >←</motion.button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                      <motion.button
                        key={p}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >{p}</motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    aria-label="Page suivante"
                  >→</motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <TaskModal
        open={taskModal.open}
        projectId={id}
        task={taskModal.task}
        defaultStatus={taskModal.defaultStatus}
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