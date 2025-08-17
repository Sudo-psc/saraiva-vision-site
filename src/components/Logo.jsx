import React from 'react';

const Logo = ({ className = "" }) => {
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/a8dfe42cbf2667c6fde2f934ce773078.png"; 
  return (
    <a href="#" className={`flex items-center ${className}`}>
      <img src={logoUrl} alt="Saraiva Vision Logo" className="h-32 md:h-36 w-auto" />
    </a>
  );
};

export default Logo;