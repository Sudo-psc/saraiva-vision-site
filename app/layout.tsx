import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
