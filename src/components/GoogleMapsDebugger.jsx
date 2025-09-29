import React, { useMemo } from 'react';

const GoogleMapsDebugger = () => {
  const debugInfo = useMemo(() => {
    const viteKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
    const maskedKey = viteKey ? `${viteKey.slice(0, 6)}•••${viteKey.slice(-4)}` : 'não definido';

    return {
      apiKeyPresent: Boolean(viteKey),
      apiKeyMasked: maskedKey,
      mapsScriptPresent: Boolean(document.querySelector('script[src*="maps.googleapis"]')),
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'desconhecido',
      buildTime: new Date().toISOString()
    };
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Verificação do ambiente</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <dt className="text-gray-500">Chave de API disponível?</dt>
          <dd className={`font-semibold ${debugInfo.apiKeyPresent ? 'text-green-600' : 'text-red-500'}`}>
            {debugInfo.apiKeyPresent ? 'Sim' : 'Não'}
          </dd>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <dt className="text-gray-500">Chave de API (mascarada)</dt>
          <dd className="font-mono text-xs text-gray-700">{debugInfo.apiKeyMasked}</dd>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <dt className="text-gray-500">Script do Google Maps carregado?</dt>
          <dd className={`font-semibold ${debugInfo.mapsScriptPresent ? 'text-green-600' : 'text-red-500'}`}>
            {debugInfo.mapsScriptPresent ? 'Sim' : 'Não'}
          </dd>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <dt className="text-gray-500">Hostname atual</dt>
          <dd className="text-gray-700">{debugInfo.hostname}</dd>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <dt className="text-gray-500">Momento da verificação</dt>
          <dd className="text-gray-700">{debugInfo.buildTime}</dd>
        </div>
      </dl>
      {!debugInfo.apiKeyPresent && (
        <p className="text-sm text-red-500">
          A variável <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> não foi encontrada.
          Garanta que ela esteja definida no ambiente de build (.env.production) e que o Vite seja
          reconstruído após qualquer alteração.
        </p>
      )}
    </div>
  );
};

export default GoogleMapsDebugger;
