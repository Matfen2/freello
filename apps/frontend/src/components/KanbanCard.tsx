import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Task } from '../lib/types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDragging?: boolean;
}

const ESTIMATION_COLORS: Record<number, string> = {
  1: 'text-emerald-500',
  2: 'text-emerald-500',
  3: 'text-amber-500',
  5: 'text-amber-500',
  8: 'text-rose-500',
  13: 'text-rose-500',
};

export function KanbanCard({ task, onEdit, onDelete, isDragging = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isSortableDragging || isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-20 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30"
      />
    );
  }

  const estColor = task.estimation
    ? ESTIMATION_COLORS[task.estimation] ?? 'text-gray-400'
    : 'text-gray-300 dark:text-gray-600';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-default"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Déplacer la tâche"
      >
        <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 4a1 1 0 100-2 1 1 0 000 2zM4 9a1 1 0 100-2 1 1 0 000 2zM4 14a1 1 0 100-2 1 1 0 000 2zM9 4a1 1 0 100-2 1 1 0 000 2zM9 9a1 1 0 100-2 1 1 0 000 2zM9 14a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-6 leading-snug mb-2">
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        {/* Estimation */}
        {task.estimation != null ? (
          <span className={`text-xs font-semibold tabular-nums ${estColor}`}>
            {task.estimation}p
          </span>
        ) : (
          <span />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            aria-label="Modifier"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            aria-label="Supprimer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}