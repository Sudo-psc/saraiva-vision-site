import { Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import { HomeData } from '../types/home';

async function getHomeData(): Promise<{ data: HomeData | null; error: string | null }> {
  // Skip API call during build time to prevent deployment errors
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return { data: null, error: null };
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://31.97.129.78:3001';

    // Add timeout and better error handling for external API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/api/home`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    // Silently fail during build, log during runtime
    if (typeof window !== 'undefined') {
      console.warn('Failed to fetch home data:', error);
    }
    return {
      data: null,
      error: null // Don't show error message in production
    };
  }
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function HomeContent() {
  const { data, error } = await getHomeData();

  return <HeroSection data={data} error={error} />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSkeleton />}>
          <HomeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}