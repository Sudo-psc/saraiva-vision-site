let mapsPromise = null;
let loadCount = 0;

// Google Maps API v3 loader with official callback pattern - eliminates warnings
export function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  if (!apiKey) return Promise.reject(new Error('Google Maps API key ausente'));

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        existing.addEventListener('load', () => {
          if (window.google && window.google.maps) {
            resolve(window.google.maps);
          } else {
            reject(new Error('Google Maps não carregou corretamente'));
          }
        });
        existing.addEventListener('error', reject);
      }
      return;
    }

    // Generate unique callback name
    const callbackName = `initGoogleMaps${++loadCount}`;

    // Set up global callback
    window[callbackName] = () => {
      // Clean up callback
      delete window[callbackName];

      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps não carregou corretamente'));
      }
    };

    // Official Google Maps loading pattern with callback - prevents warnings
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';

    script.onerror = () => {
      delete window[callbackName];
      reject(new Error('Falha ao carregar Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return mapsPromise;
}
