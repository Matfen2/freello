import type { TaskStatus } from '../lib/types';

const config: Record<TaskStatus, { label: string; classes: string }> = {
  todo: {
    label: 'À faire',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  in_progress: {
    label: 'En cours',
    classes: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  done: {
    label: 'Terminé',
    classes: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}