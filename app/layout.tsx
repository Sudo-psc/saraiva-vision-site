import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica',
  description: 'Clínica oftalmológica especializada em catarata, glaucoma, retina e cirurgia refrativa. Atendimento médico de qualidade em São Paulo.',
  keywords: 'oftalmologia, catarata, glaucoma, retina, cirurgia refrativa, São Paulo',
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
    description: 'Clínica oftalmológica especializada em catarata, glaucoma, retina e cirurgia refrativa.',
    url: 'https://saraivavision.com.br',
    siteName: 'Saraiva Vision',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica especializada em catarata, glaucoma, retina e cirurgia refrativa.',
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