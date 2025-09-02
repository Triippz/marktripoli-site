import type { Map as MapboxMap } from 'mapbox-gl';
import geofencesData from '../../data/easterEggs/geofences.json';

export interface Geofence {
  key: string;
  name: string;
  category: string;
  box: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  effects: string[];
  colors: string[];
}

export interface GeofenceBox {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface SimpleGeofence {
  key: string;
  box: GeofenceBox;
}

/**
 * Get all geofences from data
 */
export function getGeofences(): SimpleGeofence[] {
  return geofencesData.map(g => ({
    key: g.key,
    box: g.box
  }));
}

/**
 * Get full geofence data including effects and metadata
 */
export function getFullGeofences(): Geofence[] {
  return geofencesData as Geofence[];
}

/**
 * Get geofence by key
 */
export function getGeofenceByKey(key: string): Geofence | null {
  return geofencesData.find(g => g.key === key) as Geofence || null;
}

/**
 * Check if coordinates are within a geofence box
 */
export function isInGeofence(lng: number, lat: number, box: GeofenceBox): boolean {
  return lng > box.minLng && lng < box.maxLng && lat > box.minLat && lat < box.maxLat;
}

/**
 * Get center coordinates of a geofence
 */
export function getGeofenceCenter(box: GeofenceBox): [number, number] {
  const lng = (box.minLng + box.maxLng) / 2;
  const lat = (box.minLat + box.maxLat) / 2;
  return [lng, lat];
}

/**
 * Navigate map to a specific geofence
 */
export function goToGeofence(map: MapboxMap, key: string, zoom = 9): boolean {
  const geofence = getGeofenceByKey(key);
  if (!geofence) return false;

  const bounds = [
    [geofence.box.minLng, geofence.box.minLat] as [number, number],
    [geofence.box.maxLng, geofence.box.maxLat] as [number, number]
  ];

  try {
    (map as any).fitBounds(bounds as any, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: zoom,
      duration: 1200,
      essential: true
    });
    return true;
  } catch {
    const [lng, lat] = getGeofenceCenter(geofence.box);
    try {
      map.flyTo({ 
        center: [lng, lat], 
        zoom, 
        essential: true, 
        duration: 1200 
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get geofences by category
 */
export function getGeofencesByCategory(category: string): Geofence[] {
  return geofencesData.filter(g => g.category === category) as Geofence[];
}

/**
 * Get all unique categories
 */
export function getGeofenceCategories(): string[] {
  const categories = geofencesData.map(g => g.category);
  return [...new Set(categories)];
}

/**
 * Find geofences that contain the given coordinates
 */
export function findGeofencesAtLocation(lng: number, lat: number): Geofence[] {
  return geofencesData.filter(g => 
    isInGeofence(lng, lat, g.box)
  ) as Geofence[];
}