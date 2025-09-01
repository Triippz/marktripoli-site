import { useState, useEffect, useCallback, useRef } from 'react';
import { CareerMarker, CareerMapData, CareerMarkerState, CareerMarkerControls } from '../types';
import { resumeDataService } from '../../../services/resumeDataService';
import { useMissionControl } from '../../../store/missionControl';

export function useCareerMarkers(): CareerMarkerState & CareerMarkerControls {
  const [markers, setMarkers] = useState<CareerMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<CareerMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerData, setCareerData] = useState<CareerMapData | null>(null);
  const initialized = useRef(false);

  const { addTelemetry } = useMissionControl() as any;

  const addCareerTelemetry = useCallback((log: any) => {
    addTelemetry(log);
  }, [addTelemetry]);

  // Initialize career data
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadCareerData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useCareerMarkers] Loading career mission data from resume.json');
        
        const careerMapData = await resumeDataService.getCareerMapData();
        setCareerData(careerMapData);
        setMarkers(careerMapData.markers);
        
        addCareerTelemetry({
          source: 'CAREER',
          message: `Career mission data loaded - ${careerMapData.markers.length} career locations operational`,
          level: 'info'
        });

      } catch (initError) {
        console.error('[useCareerMarkers] Critical career data initialization error:', initError);
        const errorMessage = initError instanceof Error ? initError.message : 'Unknown error';
        setError(errorMessage);
        
        addCareerTelemetry({
          source: 'CAREER',
          message: `Career data initialization failed: ${errorMessage}`,
          level: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerData();
  }, [addCareerTelemetry]);

  // Control functions
  const selectMarker = useCallback((marker: CareerMarker) => {
    setSelectedMarker(marker);
    addCareerTelemetry({
      source: 'CAREER',
      message: `Engaging career target: ${marker.codename}`,
      level: 'success'
    });
  }, [addCareerTelemetry]);

  const clearSelection = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const flyToMarker = useCallback((marker: CareerMarker, map: mapboxgl.Map) => {
    map.flyTo({
      center: [marker.location.lng, marker.location.lat],
      zoom: 8,
      pitch: 10,
      bearing: 0,
      duration: 2000
    });

    addCareerTelemetry({
      source: 'CAREER',
      message: `Flying to ${marker.name} headquarters`,
      level: 'info'
    });
  }, [addCareerTelemetry]);

  return {
    markers,
    selectedMarker,
    isLoading,
    error,
    careerData,
    selectMarker,
    clearSelection,
    flyToMarker
  } as any;
}