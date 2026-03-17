import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { api } from '../lib/api';
import type { Project } from '../lib/types';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

export function DashboardPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; project?: Project }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { projects, meta, loading, error, refetch } = useProjects({ page, limit: 12 });

  const visibleProjects = projects.filter(p => !deletedIds.has(p.id));

  const handleDelete = async () => {
    if (!deleteModal.project) return;
    const deletedId = deleteModal.project.id;

    // Ferme le modal et retire la card immédiatement (optimistic)
    setDeleteModal({ open: false });
    setDeletedIds(prev => new Set([...prev, deletedId]));
    setDeleteLoading(true);

    try {
      await api.delete(`/v1/projects/${deletedId}`);
      await refetch();
    } catch {
      // Rollback visuel si l'API échoue
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(deletedId);
        return next;
      });
    } finally {
      setDeletedIds(new Set());
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end justify-between mb-10 gap-4"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase mb-1">
            Espace de travail
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
            Mes projets
          </h1>
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.p
                key={meta.total}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-400 dark:text-gray-500 mt-1"
              >
                {meta.total} projet{meta.total > 1 ? 's' : ''}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau projet
        </motion.button>
      </motion.div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse"
            />
          ))}
        </motion.div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!loading && visibleProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-5 shadow-inner">
            <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
            Aucun projet pour l&apos;instant
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7 max-w-xs">
            Créez votre premier projet et invitez votre équipe pour démarrer.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20"
          >
            Créer un projet
          </motion.button>
        </motion.div>
      )}

      {/* ── Grid ────────────────────────────────────────────────────── */}
      {!loading && visibleProjects.length > 0 && (
        <motion.div
          key={page}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {visibleProjects.map(project => (
              <motion.div
                key={project.id}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                layout
              >
                <ProjectCard
                  project={project}
                  onDelete={p => setDeleteModal({ open: true, project: p })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {meta.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Page précédente"
            >
              ←
            </motion.button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Page suivante"
            >
              →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refetch}
      />
      <DeleteConfirmModal
        open={deleteModal.open}
        title={deleteModal.project?.name ?? ''}
        entityLabel="projet"
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ open: false })}
        loading={deleteLoading}
      />
    </div>
  );
}