/**
 * Jovem Profile Home Page - Original Homepage
 * Using the classic Saraiva Vision layout with all standard sections
 */

import type { Metadata } from 'next';
import OriginalHomepage from '@/components/OriginalHomepage';
import { generateSEOHead } from '@/components/SEOHead';

export const metadata: Metadata = generateSEOHead({
  title: 'Saraiva Vision - Jovem | Clínica Oftalmológica em Caratinga',
  description: 'Clínica oftalmológica especializada em Caratinga, MG. Tecnologia de ponta para tratamentos modernos e cirurgia refrativa.',
  keywords: 'oftalmologia jovem Caratinga, cirurgia refrativa, tratamento miopia, Saraiva Vision, lentes contato, tecnologia oftalmológica',
  canonicalPath: '/jovem',
  ogType: 'website'
});

export default function JovemHomePage() {
  return <OriginalHomepage />;
}
