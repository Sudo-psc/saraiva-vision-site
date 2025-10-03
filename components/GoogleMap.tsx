'use client';

/**
 * Unified Google Maps Component
 * Supports multiple modes: simple, embedded, interactive
 * Client-side only with fallback UI for API failures
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { clinicInfo, CLINIC_PLACE_ID } from '@/lib/clinicInfo';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import type {
  GoogleMapProps,
  GoogleMapHealthStatus,
  GoogleMapsPosition,
  MapState
} from '@/types/maps';

// Declare google as global for TypeScript/ESLint
/* eslint-disable no-undef */
declare const google: any;
/* eslint-enable no-undef */

const GoogleMap: React.FC<GoogleMapProps> = ({
  mode = 'simple',
  height = 340,
  markers = [],
  zoom = 17,
  center,
  controls = {},
  showFallback: forceFallback = false,
  className = '',
  onMapLoad,
  onMarkerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    map: null,
    markers: [],
    infoWindows: [],
    isInitialized: false,
    error: null,
  });
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(forceFallback);
  const [healthStatus, setHealthStatus] = useState<GoogleMapHealthStatus | null>(null);

  // Default center to clinic location
  const mapCenter: GoogleMapsPosition = center || {
    lat: clinicInfo.latitude,
    lng: clinicInfo.longitude,
  };

  // Default controls based on mode
  const defaultControls = {
    simple: {
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    },
    embedded: {
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: false,
      fullscreenControl: true,
    },
    interactive: {
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
    },
  };

  const mapControls = { ...defaultControls[mode], ...controls };

  // Static map fallback URL (OpenStreetMap)
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoom}&size=640x360&markers=${mapCenter.lat},${mapCenter.lng},lightblue1`;

  /**
   * Enable fallback mode
   */
  const enableFallback = useCallback((message?: string) => {
    console.warn('[GoogleMap] Enabling fallback mode:', message);
    if (message) {
      setMapState(prev => ({
        ...prev,
        error: {
          code: 'UNKNOWN_ERROR',
          message,
        },
      }));
    }
    setShowFallback(true);
    setLoading(false);
  }, []);

  /**
   * Check Google Maps API health
   */
  const checkMapsHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/maps-health', {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const status: GoogleMapHealthStatus = await response.json();
        setHealthStatus(status);

        if (status.status !== 'healthy') {
          enableFallback(`Map temporarily unavailable (${status.status})`);
          return false;
        }
        return true;
      }
      return true; // Continue even if health check fails
    } catch (error) {
      console.warn('[GoogleMap] Health check failed:', error);
      return true; // Don't block on health check failure
    }
  }, [enableFallback]);

  /**
   * Initialize Google Map
   */
  const initializeMap = useCallback(async () => {
    if (!containerRef.current) {
      enableFallback('Unable to load map at this time');
      return;
    }

    try {
      // Check health first
      const isHealthy = await checkMapsHealth();
      if (!isHealthy) return;

      // Load Google Maps API
      await loadGoogleMaps();

      if (!containerRef.current) return;

      // Create map instance
      // eslint-disable-next-line no-undef
      const { Map } = await window.google.maps.importLibrary('maps') as google.maps.MapsLibrary;
      // eslint-disable-next-line no-undef
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

      // eslint-disable-next-line no-undef
      const mapOptions: google.maps.MapOptions = {
        center: mapCenter,
        zoom,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'SARAIVA_VISION_MAP',
        ...mapControls,
      };

      const map = new Map(containerRef.current, mapOptions);

      // Create default marker for clinic
      const defaultMarker = new AdvancedMarkerElement({
        map,
        position: mapCenter,
        title: clinicInfo.name,
        gmpDraggable: false,
      });

      // eslint-disable-next-line no-undef
      const createdMarkers: google.maps.Marker[] = [defaultMarker as any];

      // Create additional markers if provided
      if (markers.length > 0) {
        for (const markerConfig of markers) {
          const marker = new AdvancedMarkerElement({
            map,
            position: markerConfig.position,
            title: markerConfig.title,
            gmpDraggable: markerConfig.draggable || false,
          });

          createdMarkers.push(marker as any);

          // Add click listener if callback provided
          if (onMarkerClick) {
            marker.addListener('click', () => {
              onMarkerClick(marker as any, createdMarkers.length - 1);
            });
          }
        }
      }

      // Try to get place details if available
      if (CLINIC_PLACE_ID && window.google?.maps?.places && mode !== 'simple') {
        try {
          // eslint-disable-next-line no-undef
          const { PlacesService } = await window.google.maps.importLibrary('places') as google.maps.PlacesLibrary;
          const service = new PlacesService(map);

          service.getDetails(
            {
              placeId: CLINIC_PLACE_ID,
              fields: ['geometry', 'name', 'url'],
            },
            (place, status) => {
              // eslint-disable-next-line no-undef
              if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                map.setCenter(place.geometry.location);
                defaultMarker.position = place.geometry.location;
              }
            }
          );
        } catch (error) {
          console.warn('[GoogleMap] Could not load place details:', error);
        }
      }

      // Update state
      setMapState({
        map,
        markers: createdMarkers,
        infoWindows: [],
        isInitialized: true,
        error: null,
      });

      setLoading(false);

      // Callback for map load
      if (onMapLoad) {
        onMapLoad(map);
      }

      console.log('✅ [GoogleMap] Map initialized successfully');
    } catch (error) {
      console.error('❌ [GoogleMap] Initialization error:', error);
      enableFallback(
        `Unable to load map: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [
    mapCenter,
    zoom,
    mode,
    markers,
    mapControls,
    onMapLoad,
    onMarkerClick,
    enableFallback,
    checkMapsHealth,
  ]);

  /**
   * Initialize map on mount
   */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted && !forceFallback) {
        await initializeMap();
      }
    };

    init();

    return () => {
      isMounted = false;

      // Cleanup markers
      if (mapState.markers.length > 0) {
        mapState.markers.forEach(marker => {
          if ('map' in marker) {
            (marker as any).map = null;
          }
        });
      }

      // Cleanup map
      if (mapState.map) {
        // Google Maps doesn't have explicit cleanup, just null the reference
        setMapState(prev => ({ ...prev, map: null }));
      }
    };
  }, [forceFallback, initializeMap]);

  /**
   * Fallback UI component
   */
  const MapFallback = () => (
    <div
      className="relative w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg overflow-hidden"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Clinic Location</h3>
            <p className="text-sm text-gray-600 mb-3">
              {clinicInfo.address.street}
              <br />
              {clinicInfo.address.city}, {clinicInfo.address.state}
              <br />
              CEP: {clinicInfo.address.zip}
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <img
                src={staticMapUrl}
                alt={`Static map of ${clinicInfo.name} location`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            {(healthStatus?.status || mapState.error) && (
              <p className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {mapState.error?.message || 'Interactive map temporarily unavailable'}
              </p>
            )}
            <div className="space-y-2 mt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}&query_place_id=${CLINIC_PLACE_ID || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Loading state
   */
  if (loading && !showFallback) {
    return (
      <div
        className={`relative w-full flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  /**
   * Fallback state
   */
  if (showFallback || mapState.error) {
    return <MapFallback />;
  }

  /**
   * Map container
   */
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div ref={containerRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMap;
