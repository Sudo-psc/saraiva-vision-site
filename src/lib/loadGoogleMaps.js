let mapsPromise = null;

export function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  if (!apiKey) return Promise.reject(new Error('Google Maps API key ausente'));

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', reject);
      return;
    }
    const callbackName = '__googleMapsInit' + Math.random().toString(36).slice(2);
    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onerror = () => {
      reject(new Error('Falha ao carregar Google Maps'));
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}
