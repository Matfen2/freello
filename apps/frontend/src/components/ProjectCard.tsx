import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../lib/types';

interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

const ACCENTS = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
];

function getAccent(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENTS[sum % ACCENTS.length];
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const accent = getAccent(project.id);

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-transparent hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/40 transition-all duration-200"
    >
      {/* Gradient top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

      {/* Delete button — toujours visible, style pill rouge */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(project); }}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:border-rose-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
        aria-label="Supprimer le projet"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Supprimer
      </button>

      {/* Clickable area */}
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        className="text-left w-full p-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-2 pr-24 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>

        <div className="min-h-[2.5rem] mb-4">
          {project.description ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-gray-300 dark:text-gray-600 italic">
              Aucune description
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {formatDate(project.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Ouvrir
            <svg className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </button>
    </motion.div>
  );
}