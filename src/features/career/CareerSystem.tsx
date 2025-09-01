import React from 'react';
import { useCareerMarkers } from './hooks/useCareerMarkers';
import CareerMarkerRenderer from './components/CareerMarkerRenderer';
import CareerDetailsDialog from './components/CareerDetailsDialog';
import MissionLegend from './components/MissionLegend';
import { CareerMarker } from './types';

interface CareerSystemProps {
  map: mapboxgl.Map | null;
  isMapLoaded: boolean;
  isUXVActive?: boolean;
  onUXVTarget?: (position: { lng: number; lat: number }) => void;
}

const CareerSystem: React.FC<CareerSystemProps> = ({
  map,
  isMapLoaded,
  isUXVActive = false,
  onUXVTarget
}) => {
  const {
    markers,
    selectedMarker,
    isLoading,
    error,
    careerData,
    selectMarker,
    clearSelection,
    flyToMarker
  } = useCareerMarkers();

  const handleMarkerClick = (marker: CareerMarker) => {
    selectMarker(marker);
    if (map) {
      flyToMarker(marker, map);
    }
  };

  const handleUXVTarget = (marker: CareerMarker) => {
    if (onUXVTarget) {
      onUXVTarget({
        lng: marker.location.lng,
        lat: marker.location.lat
      });
    }
  };

  // Don't render if map isn't loaded
  if (!isMapLoaded || !map || isLoading) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className="absolute top-4 right-4 z-60">
        <div className="bg-red-900/90 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-red-500 text-xs font-mono mb-1">CAREER DATA ERROR</div>
          <div className="text-red-400 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Career marker renderer */}
      {careerData && (
        <CareerMarkerRenderer
          map={map}
          careerData={careerData}
          onMarkerClick={handleMarkerClick}
          onUXVTarget={handleUXVTarget}
          isUXVActive={isUXVActive}
        />
      )}

      {/* Mission legend */}
      {careerData && (
        <div className="absolute right-4 z-60 top-20 md:top-24">
          <MissionLegend careerData={careerData} />
        </div>
      )}

      {/* Career details dialog */}
      {selectedMarker && (
        <CareerDetailsDialog
          marker={selectedMarker}
          onClose={clearSelection}
        />
      )}
    </>
  );
};

export default CareerSystem;