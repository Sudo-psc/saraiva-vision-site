import { Suspense } from 'react';
import { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';
import { getServicesData } from '@/lib/services-api';

// Server-side data fetching
async function getServices() {
  try {
    const services = await getServicesData();
    return services;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    // Return fallback data
    return [
      {
        id: 'consultas-oftalmologicas',
        title: 'Consultas Oftalmológicas',
        description: 'Avaliação completa da saúde ocular com equipamentos modernos.',
        imageUrl: '/images/eye-consultation.jpg',
        slug: 'consultas-oftalmologicas'
      },
      {
        id: 'exames-diagnosticos',
        title: 'Exames Diagnósticos',
        description: 'Exames precisos para diagnóstico precoce de doenças oculares.',
        imageUrl: '/images/diagnostic-exams.jpg',
        slug: 'exames-diagnosticos'
      },
      {
        id: 'cirurgias-especializadas',
        title: 'Cirurgias Especializadas',
        description: 'Procedimentos cirúrgicos com tecnologia de última geração.',
        imageUrl: '/images/surgeries.jpg',
        slug: 'cirurgias-especializadas'
      },
      {
        id: 'oftalmologia-pediatrica',
        title: 'Oftalmologia Pediátrica',
        description: 'Cuidados especializados para a saúde ocular infantil.',
        imageUrl: '/images/pediatric-ophthalmology.jpg',
        slug: 'oftalmologia-pediatrica'
      }
    ];
  }
}

export const metadata: Metadata = {
  title: 'Serviços Oftalmológicos | Saraiva Vision',
  description: 'Conheça nossos serviços especializados em oftalmologia: consultas, exames diagnósticos, cirurgias e cuidados pediátricos.',
  keywords: 'oftalmologia, serviços, consultas, exames, cirurgias, oftalmologia pediátrica',
  openGraph: {
    title: 'Serviços Oftalmológicos | Saraiva Vision',
    description: 'Conheça nossos serviços especializados em oftalmologia.',
    type: 'website',
  },
};

export default async function ServicosPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesPageClient services={services} />
      </Suspense>
    </div>
  );
}

// Loading skeleton component
function ServicesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}