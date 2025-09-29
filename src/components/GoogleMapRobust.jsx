import React from 'react';
import GoogleMapSimple from '@/components/GoogleMapSimple.jsx';

const GoogleMapRobust = ({ height }) => {
  return <GoogleMapSimple height={height || 320} />;
};

export default GoogleMapRobust;
