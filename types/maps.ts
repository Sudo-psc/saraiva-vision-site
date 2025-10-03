/**
 * Google Maps Type Definitions
 * Comprehensive types for Google Maps integration
 */

// Google Maps API types
export interface GoogleMapsPosition {
  lat: number;
  lng: number;
}

export interface GoogleMapsMarker {
  position: GoogleMapsPosition;
  title: string;
  icon?: string;
  draggable?: boolean;
  animation?: google.maps.Animation;
}

export interface GoogleMapsInfoWindow {
  content: string | HTMLElement;
  position?: GoogleMapsPosition;
}

export type GoogleMapMode = 'simple' | 'embedded' | 'interactive';

export interface GoogleMapControlsConfig {
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
}

export interface GoogleMapProps {
  mode?: GoogleMapMode;
  height?: number | string;
  markers?: GoogleMapsMarker[];
  zoom?: number;
  center?: GoogleMapsPosition;
  controls?: GoogleMapControlsConfig;
  showFallback?: boolean;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  onMarkerClick?: (marker: google.maps.Marker, index: number) => void;
}

export interface GoogleMapHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  timestamp?: string;
}

export interface GoogleLocalSectionProps {
  className?: string;
}

// Google Maps Loader types
export interface GoogleMapsLoaderConfig {
  apiKey: string;
  version?: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

export interface GoogleMapsLoaderState {
  loaded: boolean;
  loading: boolean;
  error: Error | null;
}

// Google Places API types
export interface GooglePlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  geometry?: {
    location: GoogleMapsPosition;
  };
  rating?: number;
  userRatingsTotal?: number;
  url?: string;
  website?: string;
  phoneNumber?: string;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
}

// Error types
export type GoogleMapsError =
  | 'API_KEY_MISSING'
  | 'API_KEY_INVALID'
  | 'LOAD_TIMEOUT'
  | 'SCRIPT_LOAD_FAILED'
  | 'LIBRARY_LOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface GoogleMapsErrorDetails {
  code: GoogleMapsError;
  message: string;
  originalError?: Error;
}

// Static map fallback
export interface StaticMapConfig {
  center: GoogleMapsPosition;
  zoom: number;
  size: { width: number; height: number };
  markers?: Array<{
    position: GoogleMapsPosition;
    color?: string;
    label?: string;
  }>;
}

// Map state management
export interface MapState {
  map: google.maps.Map | null;
  markers: google.maps.Marker[];
  infoWindows: google.maps.InfoWindow[];
  isInitialized: boolean;
  error: GoogleMapsErrorDetails | null;
}

// Directions API types (for future use)
export interface DirectionsConfig {
  origin: GoogleMapsPosition | string;
  destination: GoogleMapsPosition | string;
  travelMode?: google.maps.TravelMode;
  waypoints?: Array<{
    location: GoogleMapsPosition | string;
    stopover?: boolean;
  }>;
}
