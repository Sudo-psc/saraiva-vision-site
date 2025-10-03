import React from 'react';
import Image from 'next/image';
import { User, Stethoscope, Award, Mail, Phone } from 'lucide-react';
import type { AuthorProfileProps } from '@/types/blog';

/**
 * AuthorProfile - Displays author credentials and contact information
 * Builds trust and credibility for medical content with CFM compliance
 *
 * Features:
 * - Professional medical credentials display
 * - Optimized image loading with Next.js Image
 * - Optional contact information
 * - Credibility indicators (verified, specialist badges)
 * - Sticky positioning for sidebar placement
 * - WCAG AA compliant with proper semantic HTML
 *
 * @example
 * ```tsx
 * <AuthorProfile
 *   name="Dr. Philipe Saraiva Cruz"
 *   crm="CRM-MG 69.870"
 *   specialty="Cirurgia Refrativa e Catarata"
 *   showContact={true}
 * />
 * ```
 */
export function AuthorProfile({
  name = 'Dr. Philipe Saraiva Cruz',
  role = 'Oftalmologista',
  crm = 'CRM-MG 69.870',
  specialty = 'Cirurgia Refrativa e Catarata',
  image = '/img/team/dr-philipe.jpg',
  bio = 'Especialista em oftalmologia com mais de 10 anos de experiência em cirurgias refrativas e tratamento de catarata.',
  email = 'contato@saraivavision.com.br',
  phone = '(33) 99860-1427',
  showContact = false,
  className = '',
}: AuthorProfileProps) {
  return (
    <aside
      className={`bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-24 ${className}`}
      aria-label="Perfil do autor"
    >
      {/* Author Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Author Image */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <Image
            src={image}
            alt={`Foto de ${name}`}
            width={80}
            height={80}
            className="rounded-full border-4 border-white shadow-md object-cover"
            priority={false}
            onError={(e) => {
              // Fallback to default image on error
              const target = e.target as HTMLImageElement;
              target.src = '/img/team/default-doctor.jpg';
            }}
          />
          {/* Verified Badge */}
          <div
            className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 shadow-md"
            aria-label="Médico verificado"
          >
            <Award className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">{role}</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">{crm}</p>
        </div>
      </div>

      {/* Specialty Badge */}
      <div className="bg-white rounded-lg p-3 mb-4 border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">Especialidade</p>
        <p className="text-sm font-semibold text-gray-900">{specialty}</p>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4">{bio}</p>

      {/* Contact Info (optional) */}
      {showContact && (
        <div className="space-y-2 pt-4 border-t border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contato</h4>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Mail
              className="w-4 h-4 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span className="text-xs break-all">{email}</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Phone
              className="w-4 h-4 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span className="text-xs">{phone}</span>
          </a>
        </div>
      )}

      {/* Credibility Indicators */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-blue-600" aria-hidden="true" />
            <span>Verificado</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-blue-600" aria-hidden="true" />
            <span>Especialista</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AuthorProfile;
