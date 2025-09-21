import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { getHomeData } from '@/lib/api/home';
import { HomeData } from '@/types/home';

// Server Component - Fetch data at build/request time
export default async function HomePage() {
  let homeData: HomeData | null = null;
  let error: string | null = null;

  try {
    // Fetch data from VPS API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      // Use 'no-store' for fresh data, or 'force-cache' for ISR
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    homeData = data.data || data; // Handle different response structures

  } catch (err) {
    console.error('Failed to fetch home data:', err);
    error = err instanceof Error ? err.message : 'Unknown error';

    // Fallback to mock data for development
    homeData = {
      title: 'Cuidando da sua visão com excelência',
      subtitle: 'Agende sua consulta hoje mesmo e tenha acesso aos melhores cuidados oftalmológicos.',
      imageUrl: '/images/hero.webp',
      ctaButtons: [
        { label: 'Agendar Consulta', link: '/contato', primary: true },
        { label: 'Saiba Mais', link: '#services', primary: false }
      ],
      promoText: 'Mês de Setembro com 50% de desconto em consultas iniciais!'
    };
  }

  const seo = {
    title: 'Saraiva Vision - Clínica Oftalmológica | Cuidando da sua visão com excelência',
    description: homeData?.subtitle || 'Clínica oftalmológica especializada em cuidados visuais completos.',
    keywords: 'oftalmologia, clínica, visão, consultas, exames, cirurgias',
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection
            data={homeData}
            error={error}
          />
        </Suspense>

        {/* Additional sections can be added here */}
        {homeData?.promoText && (
          <section className="py-8 bg-blue-50">
            <div className="container mx-auto px-4 text-center">
              <p className="text-lg font-semibold text-blue-800">
                {homeData.promoText}
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Loading skeleton for Hero section
function HeroSkeleton() {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 min-h-[100dvh] bg-gray-100 animate-pulse">
      <div className="container mx-auto px-6 md:px-8 lg:px-[6%] xl:px-[7%] 2xl:px-[8%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-12 bg-gray-300 rounded w-full"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-300 rounded w-40"></div>
              <div className="h-12 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-300 rounded-3xl"></div>
        </div>
      </div>
    </section>
  );
}