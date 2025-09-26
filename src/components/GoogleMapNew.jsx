import React, { useEffect, useRef } from 'react';
import { clinicInfo } from '@/lib/clinicInfo';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';

const GoogleMap = ({ height = 340 }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
      let isMounted = true;
      
      const initMap = async () => {
        try {
          // Ensure Google Maps is loaded with required libraries
          await loadGoogleMaps();
          
          if (!isMounted || !containerRef.current) return;

          // Create map instance
          const { Map } = await window.google.maps.importLibrary('maps');
          const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
          
          const map = new Map(containerRef.current, {
            center: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
            zoom: 16,
            mapId: 'SARAIVA_VISION_MAP', // Required for AdvancedMarkerElement
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: true
          });

          // Create advanced marker
          const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
            title: clinicInfo.name,
            gmpDraggable: false
          });

          // Store references for cleanup
          mapRef.current = map;
          markerRef.current = marker;

          console.log('✅ [DEBUG] Mapa inicializado com AdvancedMarkerElement');
          
        } catch (error) {
          console.error('❌ [ERROR] Erro ao inicializar mapa:', error);
        }
      };
      
      initMap();
      
      return () => { 
        isMounted = false;
        
        // Cleanup marker
        if (markerRef.current) {
          markerRef.current.map = null;
          markerRef.current = null;
        }
        
        // Cleanup map
        if (mapRef.current) {
          mapRef.current = null;
        }
      };
    }, []);

    return (
        <div className="relative w-full" style={{ height }}>
            <div ref={containerRef} className="w-full h-full rounded" />
        </div>
    );
};

export default GoogleMap;