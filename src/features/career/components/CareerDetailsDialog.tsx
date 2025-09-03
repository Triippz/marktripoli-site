import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { CareerMarker } from '../../../types/careerData';
import { resumeDataService } from '../../../services/resumeDataService';
import { useResponsive } from '../../../hooks/useResponsive';

interface CareerDetailsDialogProps {
  marker: CareerMarker;
  onClose: () => void;
}

const CareerDetailsDialog: React.FC<CareerDetailsDialogProps> = ({ marker, onClose }) => {
  const { isMobile } = useResponsive();

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed bg-black bg-opacity-75 z-[110] overflow-y-auto ${
        isMobile 
          ? 'inset-0 pt-20 pb-4 px-4 flex items-start' // Account for mobile navbar height
          : 'inset-0 p-4 flex items-center justify-center'
      }`}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Dialog content */}
      <div className={`relative tactical-glass bg-black/70 border border-green-500/30 rounded-lg ${
        isMobile 
          ? 'w-full max-h-[calc(100vh-8rem)] overflow-y-auto p-4 my-auto'
          : 'w-[90vw] max-w-2xl mx-auto p-5 my-8'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {marker.logo && (
              <img
                src={marker.logo}
                alt={marker.name}
                className="w-10 h-10 rounded-full border border-green-500/40 object-contain bg-black/40"
              />
            )}
            <div>
              <div className="holo-text font-mono text-xl">{marker.name}</div>
              {marker.codename && (
                <div className="text-green-500 font-mono text-xs">{marker.codename}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`tactical-button transition-colors ${
              isMobile 
                ? 'p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-green-400 hover:text-green-300' 
                : 'text-xs px-2 py-1'
            }`}
            aria-label="Close dialog"
          >
            {isMobile ? (
              <FontAwesomeIcon icon={faTimes} size="lg" />
            ) : (
              'Close'
            )}
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono text-white">
          {marker.position && (
            <div>
              <span className="text-green-400">Position:</span> {marker.position}
            </div>
          )}
          <div>
            <span className="text-green-400">Dates:</span> {resumeDataService.getDateRange(marker)}
          </div>
          <div>
            <span className="text-green-400">Location:</span> {marker.location.city || ''}{marker.location.city ? ', ' : ''}{marker.location.region || ''}
          </div>
          <div>
            <span className="text-green-400">Coords:</span> {marker.location.lat.toFixed(4)}, {marker.location.lng.toFixed(4)}
          </div>
        </div>

        {/* Marine Corps Easter Egg */}
        {(marker.name?.toLowerCase().includes('marine') || marker.name?.toLowerCase().includes('corps')) && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded tactical-glass">
            <div className="text-center text-yellow-400 font-mono text-sm mb-2">
              🎵 SPECIAL RECOGNITION 🎵
            </div>
            <div className="text-center text-white font-mono text-sm mb-1">
              "They wrote a song about me!"
            </div>
            <div className="text-center text-gray-300 font-mono text-xs italic">
              "From the Halls of Montezuma to the shores of Tripoli..."
            </div>
            <div className="text-center text-red-400 font-mono text-xs mt-2">
              Coincidence? I think not. 🦅
            </div>
          </div>
        )}

        {/* Summary */}
        {marker.summary && (
          <div className="text-sm text-gray-200 font-mono mb-4">{marker.summary}</div>
        )}

        {/* Highlights */}
        {marker.highlights && marker.highlights.length > 0 && (
          <div className="mb-4">
            <div className="text-green-400 font-mono text-xs mb-2">Highlights</div>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-200">
              {marker.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech stacks */}
        <div className="flex flex-col gap-2">
          {marker.languages && marker.languages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 font-mono text-xs">Languages:</span>
              <div className="flex flex-wrap gap-1">
                {marker.languages.map((t, i) => (
                  <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          
          {marker.frameworks && marker.frameworks.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 font-mono text-xs">Frameworks:</span>
              <div className="flex flex-wrap gap-1">
                {marker.frameworks.map((t, i) => (
                  <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          
          {marker.technologies && marker.technologies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 font-mono text-xs">Technologies:</span>
              <div className="flex flex-wrap gap-1">
                {marker.technologies.map((t, i) => (
                  <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          
          {marker.skills && marker.skills.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 font-mono text-xs">Skills:</span>
              <div className="flex flex-wrap gap-1">
                {marker.skills.map((t, i) => (
                  <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerDetailsDialog;