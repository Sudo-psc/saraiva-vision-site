import React from 'react';
import { Link } from 'react-router-dom';

const ServiceLinkDebug = ({ serviceId, children }) => {
  const handleClick = (e) => {
    console.log('Service link clicked:', serviceId);
    console.log('Event:', e);
    console.log('Default prevented?', e.defaultPrevented);
    console.log('Target:', e.target);
    console.log('Current target:', e.currentTarget);
    
    // Log the href
    const href = `/servicos/${serviceId}`;
    console.log('Navigating to:', href);
    
    // Check if React Router is working
    setTimeout(() => {
      console.log('After navigation - Current URL:', window.location.pathname);
    }, 100);
  };

  return (
    <Link
      to={`/servicos/${serviceId}`}
      onClick={handleClick}
      className="service-link-debug"
      data-service-id={serviceId}
    >
      {children}
    </Link>
  );
};

export default ServiceLinkDebug;