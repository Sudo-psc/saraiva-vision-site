import React, { useState } from 'react';
import ServicesFixed from '@/components/ServicesFixed';

// Versão debug - testando Services simplificado
function HomePageDebug() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          🏥 Sistema Médico Saraiva Vision - TESTE SERVICES
        </h1>
        
        <div className="bg-green-100 border border-green-400 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-green-800 mb-4">✅ SISTEMA BÁSICO OK</h2>
          <p className="text-green-700">Contador: {count}</p>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            +1
          </button>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">✅ TESTE: Services Simplificado</h2>
          <p className="text-yellow-700 mb-4">
            Se aparecer o erro aqui, é no componente Services. Se não, o problema é em outro lugar.
          </p>
        </div>
      </div>
      
      {/* TESTE DO COMPONENTE SERVICES CORRIGIDO */}
      <ServicesFixed />
      
      <div className="p-8 text-center">
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">✅ SUCESSO</h2>
          <p className="text-blue-700">Se você vê esta mensagem, o Services simplificado funciona!</p>
        </div>
      </div>
    </div>
  );
}

export default HomePageDebug;