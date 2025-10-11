import React from 'react';
import OpenStreetMapSimple from '@/components/OpenStreetMapSimple.jsx';

/**
 * GoogleMapRobust - Agora usa OpenStreetMap
 *
 * Migrado para OpenStreetMap para eliminar dependência de Google Maps API key
 * - 100% gratuito e open-source
 * - Sem necessidade de API key
 * - Mantém compatibilidade com código existente
 */
const GoogleMapRobust = ({ height }) => {
  return <OpenStreetMapSimple height={height || 320} />;
};

export default GoogleMapRobust;
