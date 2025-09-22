import { Metadata } from 'next';
import { Suspense } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica | Cuidando da sua visão com excelência',
  description: 'Clínica oftalmológica especializada em cuidados visuais completos. Agende sua consulta hoje mesmo.',
  keywords: 'oftalmologia, clínica, visão, consultas, exames, cirurgias, catarata, glaucoma, retina',
  authors: [{ name: 'Saraiva Vision' }],
  creator: 'Saraiva Vision',
  publisher: 'Saraiva Vision',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://saraivavision.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica especializada em cuidados visuais completos.',
    url: 'https://saraivavision.com.br',
    siteName: 'Saraiva Vision',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/hero.webp',
        width: 1200,
        height: 630,
        alt: 'Saraiva Vision - Clínica Oftalmológica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica especializada em cuidados visuais completos.',
    images: ['/images/hero.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <Hero />
        </Suspense>
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