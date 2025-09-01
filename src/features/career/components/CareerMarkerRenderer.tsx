import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { CareerMarker, CareerMapData } from '../types';
import { resumeDataService } from '../../../services/resumeDataService';

interface CareerMarkerRendererProps {
  map: mapboxgl.Map;
  careerData: CareerMapData;
  onMarkerClick: (marker: CareerMarker) => void;
  onUXVTarget?: (marker: CareerMarker) => void;
  isUXVActive?: boolean;
}

const CareerMarkerRenderer: React.FC<CareerMarkerRendererProps> = ({
  map,
  careerData,
  onMarkerClick,
  onUXVTarget,
  isUXVActive = false
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const ensureMarkerStylesInjected = useCallback(() => {
    const styleId = 'career-marker-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .career-marker .marker-container {
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }
      .career-marker .marker-logo {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid var(--marker-color, #00ff00);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        position: relative;
      }
      .career-marker .marker-logo img {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        object-fit: contain;
      }
      .career-marker .marker-fallback {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--marker-color, #00ff00);
        border: 2px solid var(--marker-color, #00ff00);
        box-shadow: 0 0 8px var(--marker-glow, rgba(0,255,0,0.6));
      }
      .tactical-popup.career-popup .popup-header .mission-codename,
      .tactical-popup.career-popup .popup-body .date-range,
      .tactical-popup.career-popup .popup-footer .category {
        color: var(--marker-color, #00ff00);
      }
      .tactical-popup.career-popup .popup-footer .status-current {
        background: #00ff00;
        color: #000000;
        padding: 1px 4px;
        border-radius: 2px;
        font-size: 8px;
        font-weight: bold;
      }
      .tactical-popup.career-popup .career-popup-content {
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid var(--marker-color, #00ff00);
        color: #ffffff;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        padding: 12px;
        border-radius: 6px;
        min-width: 200px;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const createMarkerElement = useCallback((marker: CareerMarker): HTMLElement => {
    const markerElement = document.createElement('div');
    markerElement.className = 'career-marker';
    
    const categoryStyle = resumeDataService.getCategoryStyle(marker.type);
    
    markerElement.innerHTML = `
      <div class="marker-container">
        ${marker.logo ? 
          `<div class="marker-logo">
             <img src="${marker.logo}" alt="${marker.name}" />
           </div>` : 
          `<div class="marker-fallback"></div>`
        }
      </div>
    `;
    
    markerElement.style.cssText = `
      width: 32px;
      height: 32px;
      cursor: none;
      --marker-color: ${categoryStyle.color};
      --marker-glow: ${categoryStyle.glowColor};
    `;

    return markerElement;
  }, []);

  // Create and manage markers
  useEffect(() => {
    if (!map || !careerData) return;

    ensureMarkerStylesInjected();

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (error) {
        console.warn('[CareerMarkerRenderer] Error removing marker:', error);
      }
    });
    markersRef.current = [];

    // Create new markers
    careerData.markers.forEach((careerMarker) => {
      const markerElement = createMarkerElement(careerMarker);
      
      const coordinates: [number, number] = [careerMarker.location.lng, careerMarker.location.lat];
      console.log(`[CareerMarkerRenderer] 📍 Adding ${careerMarker.type} marker:`, {
        company: careerMarker.name,
        position: careerMarker.position,
        coordinates: coordinates,
        location: `${careerMarker.location.city}, ${careerMarker.location.region}`,
        codename: careerMarker.codename
      });
      
      // Create mapbox marker with center anchor
      const mapboxMarker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat(coordinates)
        .addTo(map);
      
      markersRef.current.push(mapboxMarker);

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (isUXVActive && onUXVTarget) {
          onUXVTarget(careerMarker);
        } else {
          onMarkerClick(careerMarker);
        }
      });

      // Enhanced popup with career information
      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: false,
        className: 'tactical-popup career-popup'
      }).setHTML(`
        <div class="career-popup-content" style="--marker-color: ${resumeDataService.getCategoryStyle(careerMarker.type).color}">
          <div class="popup-header">
            <div class="company-name">${careerMarker.name}</div>
            <div class="mission-codename">${careerMarker.codename}</div>
          </div>
          <div class="popup-body">
            <div class="position">${careerMarker.position}</div>
            <div class="date-range">${resumeDataService.getDateRange(careerMarker)}</div>
            <div class="location">${careerMarker.location.city}, ${careerMarker.location.region}</div>
            <div class="coordinates">${resumeDataService.getTacticalCoords(careerMarker)}</div>
          </div>
          <div class="popup-footer">
            <div class="category">${careerMarker.category}</div>
            ${careerMarker.isCurrent ? '<div class="status-current">ACTIVE</div>' : ''}
          </div>
        </div>
      `);
      
      // Add static popup css for general layout (colors come from CSS variables above)
      const headerStyleId = 'career-popup-static-styles';
      if (!document.getElementById(headerStyleId)) {
        const style = document.createElement('style');
        style.id = headerStyleId;
        style.textContent = `
        .tactical-popup.career-popup .popup-header .company-name {
          color: #ffffff;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 2px;
        }
        .tactical-popup.career-popup .popup-header .mission-codename { font-size: 10px; margin-bottom: 8px; }
        .tactical-popup.career-popup .popup-body .position {
          color: #cccccc;
          margin-bottom: 4px;
        }
        .tactical-popup.career-popup .popup-body .date-range { font-size: 10px; margin-bottom: 2px; }
        .tactical-popup.career-popup .popup-body .location,
        .tactical-popup.career-popup .popup-body .coordinates {
          color: #888888;
          font-size: 9px;
        }
        .tactical-popup.career-popup .popup-footer {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tactical-popup.career-popup .popup-footer .category { font-size: 9px; text-transform: uppercase; }
        `;
        document.head.appendChild(style);
      }

      markerElement.addEventListener('mouseenter', () => {
        mapboxMarker.setPopup(popup).togglePopup();
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });

    // Note: removed automatic fitBounds on load to avoid fighting intro animations and user interactions.

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (error) {
          console.warn('[CareerMarkerRenderer] Error removing marker during cleanup:', error);
        }
      });
      markersRef.current = [];
    };
  }, [map, careerData, createMarkerElement, onMarkerClick, onUXVTarget, isUXVActive, ensureMarkerStylesInjected]);

  return null;
};

export default CareerMarkerRenderer;
