import React from 'react';
import GoogleMapSimple from '@/components/GoogleMapSimple.jsx';
import GoogleMapNew from '@/components/GoogleMapNew.jsx';
import GoogleMapsDebugger from '@/components/GoogleMapsDebugger.jsx';

const MapTestPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 space-y-12">
        <section className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Diagnóstico Google Maps</h1>
          <p className="text-gray-600 mb-6">
            Esta página carrega as variações do componente de mapa para validar o carregamento
            da chave de API em produção e o comportamento do fallback quando a chave não está
            disponível ou ocorre algum erro de rede.
          </p>
          <GoogleMapsDebugger />
        </section>

        <section className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa embutido (versão atual)</h2>
          <p className="text-gray-600 mb-4">
            Este componente utiliza o loader dinâmico de Google Maps com detecção de erros.
          </p>
          <div className="h-96">
            <GoogleMapSimple />
          </div>
        </section>

        <section className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa com Place ID resiliente</h2>
          <p className="text-gray-600 mb-4">
            Versão alternativa que utiliza Place ID dinâmico e lógica de fallback configurada na
            aplicação.
          </p>
          <div className="h-96">
            <GoogleMapNew />
          </div>
        </section>
      </div>
    </main>
  );
};

export default MapTestPage;
