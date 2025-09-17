import React from 'react';
import GoogleMapNew from '@/components/GoogleMapNew';

// Wrapper para manter a API estável em outros componentes
// e garantir que usamos a integração com Google Places (Place ID)
const GoogleMap = (props) => {
  return <GoogleMapNew {...props} />;
};

export default GoogleMap;
