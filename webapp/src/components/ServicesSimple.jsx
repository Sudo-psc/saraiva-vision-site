import React from 'react';

// Versão simplificada do Services para testar se o problema está neste componente
function ServicesSimple() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Serviços Oftalmológicos
          </h2>
          <p className="text-lg text-slate-600">
            Cuidados completos para sua visão
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Serviço 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Consulta Oftalmológica</h3>
            <p className="text-gray-600">Exame completo da visão e saúde ocular</p>
          </div>
          
          {/* Serviço 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Exames de Vista</h3>
            <p className="text-gray-600">Avaliação detalhada da acuidade visual</p>
          </div>
          
          {/* Serviço 3 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Prescrição de Óculos</h3>
            <p className="text-gray-600">Receita personalizada para suas necessidades</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSimple;