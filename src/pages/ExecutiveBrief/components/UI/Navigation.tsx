import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <button className="tactical-button text-xs px-3 py-2" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}