interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  entityLabel?: string; // 'tâche' par défaut, 'projet' pour les projets
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open, title, entityLabel = 'tâche', onConfirm, onClose, loading,
}: DeleteConfirmModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Supprimer {entityLabel === 'projet' ? 'le projet' : 'la tâche'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Supprimer{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            &ldquo;{title}&rdquo;
          </span>{' '}
          ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}