import type { Task } from '../lib/types';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  return (
    <div className="group flex items-start gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      {/* Status indicator */}
      <div className="mt-1 flex-shrink-0">
        <TaskStatusBadge status={task.status} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Estimation */}
      {task.estimation != null && (
        <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 mt-1">
          {task.estimation} pt{task.estimation > 1 ? 's' : ''}
        </span>
      )}

      {/* Actions — visibles au hover */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Modifier"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          title="Supprimer"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.942l-3.414.828.828-3.414A4 4 0 019 13z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h14"/>
    </svg>
  );
}