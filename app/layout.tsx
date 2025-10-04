import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/Toaster';
import { CookieConsent } from '@/components/ui/CookieConsentModal';
import ScrollToTop from '@/components/ScrollToTop';
import { SkipLinks } from '@/components/ui/SkipLinks';
import { ClientLayoutProviders } from '@/components/ClientLayoutProviders';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Saraiva Vision - Clínica Oftalmológica em Caratinga',
    template: '%s | Saraiva Vision',
  },
  description: 'Clínica oftalmológica especializada em Caratinga, MG. Cuidado personalizado com sua visão.',
  keywords: ['oftalmologia', 'oftalmologista', 'Caratinga', 'clínica', 'visão', 'saúde ocular'],
  authors: [{ name: 'Saraiva Vision' }],
  creator: 'Saraiva Vision',
  publisher: 'Saraiva Vision',
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
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://saraivavision.com.br',
    siteName: 'Saraiva Vision',
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica especializada em Caratinga, MG.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Saraiva Vision',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica especializada em Caratinga, MG.',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.facebook.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Critical CSS preload */}
        <link rel="preload" href="/globals.css" as="style" />
      </head>

      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ErrorBoundary>
          <ClientLayoutProviders>
            <I18nProvider locale="pt">
              {/* Skip links for accessibility */}
              <SkipLinks />

              {/* Navigation */}
              <Navbar />

              {/* Main content area */}
              <main id="main-content" className="flex-1 w-full pt-20 md:pt-24">
                {children}
              </main>

              {/* Footer */}
              <Footer />

              {/* Floating components */}
              <ScrollToTop showAt={400} />

              {/* Toast notifications */}
              <Toaster />

              {/* Cookie consent (LGPD) */}
              <CookieConsent />
            </I18nProvider>
          </ClientLayoutProviders>
        </ErrorBoundary>

        {/* Global scripts for analytics and tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global Google Analytics setup
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });

              // Performance monitoring
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                      console.log('CLS:', entry.value);
                    }
                  });
                });
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
