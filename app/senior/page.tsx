/**
 * Senior Profile Home Page - Original Homepage
 * Using the classic Saraiva Vision layout with all standard sections
 */

import type { Metadata } from 'next';
import OriginalHomepage from '@/components/OriginalHomepage';
import { generateSEOHead } from '@/components/SEOHead';

export const metadata: Metadata = generateSEOHead({
  title: 'Saraiva Vision - Senior | Clínica Oftalmológica em Caratinga',
  description: 'Clínica oftalmológica especializada em Caratinga, MG. Cuidado completo para terceira idade com tratamento de catarata, glaucoma e retina.',
  keywords: 'oftalmologia senior Caratinga, catarata terceira idade, glaucoma tratamento, Saraiva Vision, retina oftalmologia, idosos',
  canonicalPath: '/senior',
  ogType: 'website'
});

export default function SeniorHomePage() {
  return <OriginalHomepage />;
}
