import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanCard } from './KanbanCard';
import type { Task, TaskStatus } from '../lib/types';

interface Props {
  status: TaskStatus;
  label: string;
  accent: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
}

export function KanbanColumn({ status, label, accent, tasks, onEdit, onDelete, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-72 flex-shrink-0"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          aria-label={`Ajouter une tâche dans ${label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 rounded-2xl p-2 space-y-2 transition-colors duration-150 ${
          isOver
            ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-300 dark:ring-indigo-700'
            : 'bg-gray-50 dark:bg-gray-900/50'
        }`}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-24 text-center"
          >
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Déposez une tâche ici
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}