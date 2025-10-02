import React from 'react';
import { Navigate, useParams } from '@/utils/router';

/**
 * Componente para redirecionamento 301 de URLs antigas de serviços
 * Redireciona /servico/:serviceId para /servicos/:serviceId
 * Mantém o parâmetro serviceId na nova URL
 */
function ServiceRedirect() {
  const { serviceId } = useParams();
  
  // Redireciona para a nova estrutura de URLs
  return <Navigate to={`/servicos/${serviceId}`} replace />;
}

export default ServiceRedirect;