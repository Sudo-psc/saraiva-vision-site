import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import '../src/index.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica em Caratinga, MG',
  description: 'Clínica oftalmológica completa em Caratinga, MG. Especialidades em cirurgias de catarata, glaucoma, e tratamentos de retina. Atendimento humanizado com tecnologia de ponta.',
  metadataBase: new URL('https://saraivavision.com.br'),
  keywords: ['oftalmologia', 'clínica oftalmológica', 'cirurgia de catarata', 'glaucoma', 'retina', 'Caratinga', 'Saraiva Vision'],
  authors: [{ name: 'Dr. Saraiva' }],
  openGraph: {
    title: 'Saraiva Vision - Clínica Oftalmológica',
    description: 'Clínica oftalmológica completa em Caratinga, MG com tecnologia de ponta',
    url: 'https://saraivavision.com.br',
    siteName: 'Saraiva Vision',
    locale: 'pt_BR',
    type: 'website',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div id="root">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  )
}