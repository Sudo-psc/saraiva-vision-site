import React from 'react';

const STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-800 border-green-200',
  degraded: 'bg-amber-100 text-amber-800 border-amber-200',
  outage: 'bg-red-100 text-red-800 border-red-200'
};

const BlogStatusBanner = ({ status = 'degraded', showDetails = false, className = '' }) => {
  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS.degraded;

  return (
    <div className={`rounded-xl border ${colorClasses} px-4 py-3 text-sm ${className}`}>
      <div className="font-semibold">Status do CMS WordPress</div>
      <p className="mt-1">
        {status === 'healthy'
          ? 'O blog está operando normalmente.'
          : 'Detectamos instabilidade no WordPress. Exibindo conteúdo em cache para garantir disponibilidade.'}
      </p>
      {showDetails && (
        <ul className="mt-2 text-xs list-disc list-inside opacity-80">
          <li>Monitoramos automaticamente a saúde do CMS e tentamos novamente a cada poucos minutos.</li>
          <li>Você pode tentar recarregar a página manualmente para verificar se o serviço já foi restabelecido.</li>
        </ul>
      )}
    </div>
  );
};

export default BlogStatusBanner;
