let mapsPromise = null;
let loadAttempts = 0;
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 15000; // 15 segundos timeout

// Advanced Google Maps API loader with debugging and fallback strategies
export function loadGoogleMaps(apiKey) {
  console.log('🔍 [DEBUG] loadGoogleMaps chamado com:', {
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'null',
    windowDefined: typeof window !== 'undefined',
    attempt: loadAttempts + 1
  });

  if (typeof window === 'undefined') {
    console.error('❌ [ERROR] Window não disponível (SSR)');
    return Promise.reject(new Error('Window not available'));
  }

  if (mapsPromise) {
    console.log('🔄 [DEBUG] Retornando promise existente');
    return mapsPromise;
  }

  if (!apiKey) {
    console.error('❌ [ERROR] API Key ausente');
    return Promise.reject(new Error('Google Maps API key ausente'));
  }

  loadAttempts++;
  console.log(`🚀 [DEBUG] Iniciando carregamento (tentativa ${loadAttempts}/${MAX_ATTEMPTS})`);

  mapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      console.log('✅ [DEBUG] Google Maps já carregado');
      if (window.google.maps.importLibrary) {
        console.log('✅ [DEBUG] importLibrary disponível');
        resolve(window.google.maps);
        return;
      } else {
        console.log('⚠️ [DEBUG] Google Maps carregado mas sem importLibrary');
      }
    }

    // Setup timeout
    const timeoutId = setTimeout(() => {
      console.error(`⏰ [ERROR] Timeout após ${TIMEOUT_MS}ms`);
      if (loadAttempts < MAX_ATTEMPTS) {
        console.log(`🔄 [DEBUG] Tentando novamente... (${loadAttempts + 1}/${MAX_ATTEMPTS})`);
        mapsPromise = null;
        loadGoogleMaps(apiKey).then(resolve).catch(reject);
      } else {
        reject(new Error(`Timeout: Google Maps não carregou em ${TIMEOUT_MS}ms após ${MAX_ATTEMPTS} tentativas`));
      }
    }, TIMEOUT_MS);

    // Strategy 1: Modern importLibrary approach
    console.log('📝 [DEBUG] Criando script element...');
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = `google-maps-script-${Date.now()}`;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&libraries=places,marker&callback=initGoogleMapsCallback`;

    // Setup global callback as fallback
    const callbackName = `initGoogleMapsCallback_${Date.now()}`;
    window[callbackName] = () => {
      clearTimeout(timeoutId);
      console.log('✅ [DEBUG] Callback method executado');

      if (window.google && window.google.maps) {
        console.log('✅ [DEBUG] Google object disponível via callback');
        resolve(window.google.maps);
      } else {
        console.error('❌ [ERROR] Google object não disponível mesmo após callback');
        reject(new Error('Google Maps object não disponível após callback'));
      }

      // Cleanup
      delete window[callbackName];
    };

    // Update script with unique callback
    script.src = script.src.replace('initGoogleMapsCallback', callbackName);

    script.onload = () => {
      console.log('📦 [DEBUG] Script onload disparado');
      console.log('🔍 [DEBUG] Verificando window.google:', {
        google: typeof window.google,
        googleMaps: typeof window.google?.maps,
        importLibrary: typeof window.google?.maps?.importLibrary
      });

      // Wait for google.maps.importLibrary to be available
      let checkAttempts = 0;
      const maxCheckAttempts = 50; // 5 seconds max

      const checkImportLibrary = () => {
        checkAttempts++;
        console.log(`🔍 [DEBUG] Verificando importLibrary (tentativa ${checkAttempts}/${maxCheckAttempts})`);

        if (window.google && window.google.maps && window.google.maps.importLibrary) {
          clearTimeout(timeoutId);
          console.log('✅ [DEBUG] importLibrary pronto via onload');
          resolve(window.google.maps);
        } else if (checkAttempts < maxCheckAttempts) {
          console.log('⏳ [DEBUG] Aguardando importLibrary... próxima verificação em 100ms');
          setTimeout(checkImportLibrary, 100);
        } else {
          console.warn('⚠️ [DEBUG] importLibrary não encontrado, aguardando callback...');
          // Don't reject here, wait for callback
        }
      };

      // Start checking immediately
      setTimeout(checkImportLibrary, 10);
    };

    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('❌ [ERROR] Script onerror:', error);
      console.error('❌ [ERROR] Script src:', script.src);

      // Try alternative loading strategy
      if (loadAttempts < MAX_ATTEMPTS) {
        console.log('🔄 [DEBUG] Tentando estratégia alternativa...');
        mapsPromise = null;
        setTimeout(() => {
          loadGoogleMapsAlternative(apiKey).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(new Error(`Falha ao carregar Google Maps API: ${error.message || 'Unknown error'}`));
      }
    };

    console.log('📋 [DEBUG] Adicionando script ao DOM:', script.src);
    document.head.appendChild(script);

    // Log DOM state
    setTimeout(() => {
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      console.log(`🔍 [DEBUG] Scripts do Google Maps no DOM: ${existingScripts.length}`);
      existingScripts.forEach((s, i) => {
        console.log(`  Script ${i + 1}: ${s.src}`);
      });
    }, 1000);
  });

  return mapsPromise;
}

// Alternative loading strategy without callback
function loadGoogleMapsAlternative(apiKey) {
  console.log('🔧 [DEBUG] Usando estratégia alternativa de carregamento');

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places,marker`;

    script.onload = () => {
      console.log('✅ [DEBUG] Estratégia alternativa: script carregado');

      // Poll for Google Maps availability
      let attempts = 0;
      const maxAttempts = 100;

      const pollForGoogle = () => {
        attempts++;
        if (window.google && window.google.maps) {
          console.log('✅ [DEBUG] Estratégia alternativa: Google Maps disponível');
          resolve(window.google.maps);
        } else if (attempts < maxAttempts) {
          setTimeout(pollForGoogle, 100);
        } else {
          reject(new Error('Google Maps não disponível após estratégia alternativa'));
        }
      };

      pollForGoogle();
    };

    script.onerror = (error) => {
      console.error('❌ [ERROR] Estratégia alternativa falhou:', error);
      reject(new Error('Estratégia alternativa de carregamento falhou'));
    };

    document.head.appendChild(script);
  });
}

// Utility function to check if Google Maps is ready
export function isGoogleMapsReady() {
  const ready = !!(window.google && window.google.maps);
  console.log('🔍 [DEBUG] Google Maps ready check:', ready);
  return ready;
}

// Function to reset the loader (useful for testing)
export function resetGoogleMapsLoader() {
  console.log('🔄 [DEBUG] Resetando loader do Google Maps');
  mapsPromise = null;
  loadAttempts = 0;
}
