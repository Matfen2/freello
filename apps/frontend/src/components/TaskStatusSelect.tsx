import { useState } from 'react';
import { api } from '../lib/api';
import type { TaskStatus } from '../lib/types';

const OPTIONS: { value: TaskStatus; label: string; dot: string }[] = [
  { value: 'todo',        label: 'À faire',  dot: 'bg-gray-400' },
  { value: 'in_progress', label: 'En cours', dot: 'bg-amber-400' },
  { value: 'done',        label: 'Terminé',  dot: 'bg-emerald-500' },
];

const BADGE: Record<TaskStatus, string> = {
  todo:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  in_progress: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  done:        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface Props {
  taskId: string;
  status: TaskStatus;
  onChanged: () => void;
}

export function TaskStatusSelect({ taskId, status, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const current = OPTIONS.find(o => o.value === status) ?? OPTIONS[0];

  const handleSelect = async (newStatus: TaskStatus) => {
    if (newStatus === status) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    try {
      await api.patch(`/v1/tasks/${taskId}`, { status: newStatus });
      onChanged();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${BADGE[status]} ${
          loading ? 'opacity-50' : 'hover:ring-2 hover:ring-offset-1 hover:ring-indigo-400 dark:hover:ring-offset-gray-900'
        }`}
      >
        {loading ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        )}
        {current.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-1.5 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 overflow-hidden">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={e => { e.stopPropagation(); handleSelect(opt.value); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  opt.value === status
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                {opt.label}
                {opt.value === status && (
                  <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}