import type { Coordinates } from '../types/mission';
import type { LocationMapping } from '../types/resume';

// Predefined location mappings for resume work locations
export const LOCATION_MAPPINGS: Record<string, LocationMapping> = {
  // California locations
  'el segundo, ca': {
    city: 'El Segundo',
    state: 'California',
    coordinates: { lat: 33.9164, lng: -118.4103 },
    timezone: 'America/Los_Angeles'
  },
  'el segundo': {
    city: 'El Segundo',
    state: 'California', 
    coordinates: { lat: 33.9164, lng: -118.4103 },
    timezone: 'America/Los_Angeles'
  },
  'los angeles, ca': {
    city: 'Los Angeles',
    state: 'California',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    timezone: 'America/Los_Angeles'
  },
  
  // Massachusetts locations
  'cambridge, ma': {
    city: 'Cambridge',
    state: 'Massachusetts',
    coordinates: { lat: 42.3601, lng: -71.0942 },
    timezone: 'America/New_York'
  },
  'cambridge': {
    city: 'Cambridge',
    state: 'Massachusetts',
    coordinates: { lat: 42.3601, lng: -71.0942 },
    timezone: 'America/New_York'
  },
  'boston, ma': {
    city: 'Boston',
    state: 'Massachusetts',
    coordinates: { lat: 42.3601, lng: -71.0589 },
    timezone: 'America/New_York'
  },
  
  // Pennsylvania locations
  'philadelphia, pa': {
    city: 'Philadelphia',
    state: 'Pennsylvania',
    coordinates: { lat: 39.9526, lng: -75.1652 },
    timezone: 'America/New_York'
  },
  'philadelphia': {
    city: 'Philadelphia',
    state: 'Pennsylvania',
    coordinates: { lat: 39.9526, lng: -75.1652 },
    timezone: 'America/New_York'
  },
  
  // Default/remote work location
  'remote': {
    city: 'Remote',
    state: 'United States',
    coordinates: { lat: 39.8283, lng: -98.5795 }, // Center of US
    timezone: 'America/Chicago'
  }
};

/**
 * Normalize location string for consistent matching
 */
export function normalizeLocation(location: string): string {
  if (!location) return 'remote';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,;]/g, ',') // Normalize punctuation
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .replace(/,+/g, ',')    // Remove duplicate commas
    .replace(/,$/, '');     // Remove trailing comma
}

/**
 * Get coordinates for a location string
 */
export function getLocationCoordinates(location: string): Coordinates {
  const normalized = normalizeLocation(location);
  
  // Try exact match first
  const exactMatch = LOCATION_MAPPINGS[normalized];
  if (exactMatch) {
    return exactMatch.coordinates;
  }
  
  // Try partial matches for common patterns
  const locationKeys = Object.keys(LOCATION_MAPPINGS);
  
  // Check if location contains any of our known cities
  for (const key of locationKeys) {
    if (normalized.includes(key) || key.includes(normalized.split(',')[0])) {
      return LOCATION_MAPPINGS[key].coordinates;
    }
  }
  
  // Default to remote work coordinates (center of US)
  return LOCATION_MAPPINGS.remote.coordinates;
}

/**
 * Get full location mapping with additional metadata
 */
export function getLocationMapping(location: string): LocationMapping {
  const normalized = normalizeLocation(location);
  
  const exactMatch = LOCATION_MAPPINGS[normalized];
  if (exactMatch) {
    return exactMatch;
  }
  
  const locationKeys = Object.keys(LOCATION_MAPPINGS);
  
  for (const key of locationKeys) {
    if (normalized.includes(key) || key.includes(normalized.split(',')[0])) {
      return LOCATION_MAPPINGS[key];
    }
  }
  
  return LOCATION_MAPPINGS.remote;
}

/**
 * Add or update a location mapping
 */
export function addLocationMapping(
  locationKey: string, 
  mapping: LocationMapping
): void {
  const normalized = normalizeLocation(locationKey);
  LOCATION_MAPPINGS[normalized] = mapping;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate engagement type based on location characteristics
 */
export function getEngagementTypeForLocation(location: string): string {
  const normalized = normalizeLocation(location);
  
  // Mission Control themed engagement types based on location
  if (normalized.includes('california') || normalized.includes('los angeles')) {
    return 'deploy-uas'; // West Coast tech/aerospace theme
  }
  
  if (normalized.includes('massachusetts') || normalized.includes('cambridge') || normalized.includes('boston')) {
    return 'integration-matrix'; // East Coast academic/tech theme
  }
  
  if (normalized.includes('philadelphia') || normalized.includes('pennsylvania')) {
    return 'build-pipeline'; // Industrial/infrastructure theme
  }
  
  return 'engage'; // Default engagement
}