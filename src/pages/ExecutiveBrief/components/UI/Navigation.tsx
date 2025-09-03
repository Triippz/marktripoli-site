import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../../../hooks/useResponsive';

export function Navigation() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-500/20 px-4 py-3">
        <button 
          className="tactical-button text-xs px-3 py-2 w-full" 
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed z-50 top-4 left-4">
      <button 
        className="tactical-button text-xs px-3 py-2" 
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
    </div>
  );
}