import React from 'react';

const LensesPageSimple = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Página de Lentes - Teste Simples
        </h1>
        <p className="text-lg text-slate-600">
          Se você está vendo esta mensagem, o React está funcionando!
        </p>
        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ Componente React renderizado com sucesso
          </p>
        </div>
      </div>
    </div>
  );
};

export default LensesPageSimple;