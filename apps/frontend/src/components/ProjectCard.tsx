import { useNavigate } from 'react-router-dom';
import type { Project } from '../lib/types';

interface ProjectCardProps {
  project: Project;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group text-left w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* Accent bar */}
      <div className="w-8 h-1 rounded-full bg-indigo-500 mb-4 group-hover:w-12 transition-all duration-200" />

      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
        {project.name}
      </h3>

      {project.description ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {project.description}
        </p>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-600 italic mb-4">
          Aucune description
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600">
        Créé le {formatDate(project.createdAt)}
      </p>
    </button>
  );
}