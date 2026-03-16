import { useParams, useNavigate } from 'react-router-dom';

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
      >
        ← Retour aux projets
      </button>

      <p className="text-sm text-gray-400 dark:text-gray-600 font-mono">
        project id : {id}
      </p>
    </div>
  );
}