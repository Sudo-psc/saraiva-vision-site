import React, { useEffect, useRef } from 'react';
import { clinicInfo } from '@/lib/clinicInfo';

const GoogleMap = ({ height = 340 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
      let map = null;
      
      const initMap = () => {
        if (containerRef.current && window.google && window.google.maps) {
          map = new window.google.maps.Map(containerRef.current, {
            center: { lat: clinicInfo.latitude, lng: clinicInfo.longitude }, // Caratinga-MG
            zoom: 16
          });

          new window.google.maps.Marker({
            position: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
            map: map,
            title: clinicInfo.name
          });
        }
      };
      
      // The Google Maps script is assumed to be loaded globally
      if (window.google && window.google.maps) {
        initMap();
      } else {
        console.error("Google Maps script not loaded. Please ensure it's included in your index.html.");
      }
      
      return () => { 
        // Cleanup logic if needed
        if (map) {
          // Potentially unmount or clear map instance listeners here
          map = null; 
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