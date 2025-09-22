import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica',
  description: 'Cuidando da sua visão com excelência. Clínica oftalmológica especializada em consultas, exames e cirurgias oftalmológicas.',
  keywords: 'oftalmologia, clínica, visão, consultas, exames, cirurgias, Saraiva Vision',
  authors: [{ name: 'Saraiva Vision' }],
  creator: 'Saraiva Vision',
  publisher: 'Saraiva Vision',
  openGraph: {
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Cuidando da sua visão com excelência. Clínica oftalmológica especializada em consultas, exames e cirurgias oftalmológicas.',
    url: 'https://saraivavision.com.br',
    siteName: 'Saraiva Vision',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Cuidando da sua visão com excelência. Clínica oftalmológica especializada em consultas, exames e cirurgias oftalmológicas.',
    creator: '@saraivavision',
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}