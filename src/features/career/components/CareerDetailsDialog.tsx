import React from 'react';
import { CareerMarker } from '../types';
import { resumeDataService } from '../../../services/resumeDataService';

interface CareerDetailsDialogProps {
  marker: CareerMarker;
  onClose: () => void;
}

const CareerDetailsDialog: React.FC<CareerDetailsDialogProps> = ({ marker, onClose }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[110]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Dialog content */}
      <div className="relative tactical-glass bg-black/70 border border-green-500/30 rounded-lg p-5 w-[90vw] max-w-2xl mx-auto">
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
            className="tactical-button text-xs px-2 py-1"
          >
            Close
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