import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const WordPressAdminRedirect = () => {
  useEffect(() => {
    // Get the WordPress admin URL based on environment
    const wordpressUrl = import.meta.env.VITE_WORDPRESS_API_URL || 
                        import.meta.env.VITE_WORDPRESS_URL || 
                        'https://www.saraivavision.com.br';
    
    const adminUrl = `${wordpressUrl}/wp-admin`;
    
    // Redirect to WordPress admin after a short delay to allow component to render
    const timer = setTimeout(() => {
      window.location.href = adminUrl;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>Redirecionando para WordPress Admin...</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Redirecionando para WordPress Admin
            </h2>
            <p className="text-gray-600 mb-4">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
            <p className="text-sm text-gray-500">
              Se o redirecionamento não funcionar, 
              <a 
                href={`${import.meta.env.VITE_WORDPRESS_API_URL || import.meta.env.VITE_WORDPRESS_URL || 'https://www.saraivavision.com.br'}/wp-admin`}
                className="text-blue-600 hover:text-blue-700 underline ml-1"
              >
                clique aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WordPressAdminRedirect;