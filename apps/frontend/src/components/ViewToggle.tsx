interface Props {
  view: 'list' | 'kanban';
  onChange: (view: 'list' | 'kanban') => void;
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
      <button
        onClick={() => onChange('list')}
        aria-label="Vue liste"
        className={`p-1.5 rounded-lg transition-colors ${
          view === 'list'
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => onChange('kanban')}
        aria-label="Vue kanban"
        className={`p-1.5 rounded-lg transition-colors ${
          view === 'kanban'
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </button>
    </div>
  );
}