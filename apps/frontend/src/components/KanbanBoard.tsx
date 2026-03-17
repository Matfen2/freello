import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useKanban } from '../hooks/useKanban';
import type { Task, TaskStatus } from '../lib/types';

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: 'todo',        label: 'À faire',  accent: 'bg-gray-400' },
  { status: 'in_progress', label: 'En cours', accent: 'bg-amber-400' },
  { status: 'done',        label: 'Terminé',  accent: 'bg-emerald-400' },
];

function noop(_task: Task) { /* drag overlay — no action */ }

interface Props {
  tasks: Task[];
  refetch: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: (status?: TaskStatus) => void;
}

export function KanbanBoard({ tasks, refetch, onEdit, onDelete, onAddTask }: Props) {
  const { columns, activeTask, onDragStart, onDragOver, onDragEnd } = useKanban(tasks, refetch);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {COLUMNS.map(({ status, label, accent }, i) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.22 }}
          >
            <KanbanColumn
              status={status}
              label={label}
              accent={accent}
              tasks={columns[status]}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddTask={() => onAddTask(status)}
            />
          </motion.div>
        ))}
      </motion.div>

      <DragOverlay dropAnimation={{
        duration: 180,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="rotate-2 scale-105 opacity-90 pointer-events-none">
            <KanbanCard
              task={activeTask}
              onEdit={noop}
              onDelete={noop}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}