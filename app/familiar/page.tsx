/**
 * Familiar Profile Home Page - Original Homepage
 * Using the classic Saraiva Vision layout with all standard sections
 */

import type { Metadata } from 'next';
import OriginalHomepage from '@/components/OriginalHomepage';
import { generateSEOHead } from '@/components/SEOHead';

export const metadata: Metadata = generateSEOHead({
  title: 'Saraiva Vision - Família | Clínica Oftalmológica em Caratinga',
  description: 'Clínica oftalmológica especializada em Caratinga, MG. Cuidado completo para toda a família com equipamentos modernos e profissionais experientes.',
  keywords: 'oftalmologia familiar Caratinga, clínica olhos família, Saraiva Vision, tratamento oftalmológico infantil e adulto',
  canonicalPath: '/familiar',
  ogType: 'website'
});

export default function FamiliarHomePage() {
  return <OriginalHomepage />;
}
