import React from 'react';
import { motion } from 'framer-motion';
import { User, Stethoscope, Award, Mail, Phone } from 'lucide-react';

/**
 * AuthorProfile - Displays author credentials and contact info
 * Builds trust and credibility for medical content
 */
const AuthorProfile = ({
  name = 'Dr. Philipe Saraiva Cruz',
  role = 'Oftalmologista',
  crm = 'CRM-MG 69.870',
  specialty = 'Cirurgia Refrativa e Catarata',
  image = '/img/team/dr-philipe.jpg',
  bio = 'Especialista em oftalmologia com mais de 10 anos de experiência em cirurgias refrativas e tratamento de catarata.',
  email = 'contato@saraivavision.com.br',
  phone = '(33) 98420-7437',
  showContact = false
}) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-24"
      aria-label="Perfil do autor"
    >
      {/* Author Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={`Foto de ${name}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            style={{ maxWidth: '100%', display: 'block' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/team/default-doctor.jpg';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 shadow-md">
            <Award className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        </div>

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
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {bio}
      </p>

      {/* Contact Info (optional) */}
      {showContact && (
        <div className="space-y-2 pt-4 border-t border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contato</h4>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="text-xs">{email}</span>
          </a>

          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
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
    </motion.aside>
  );
};

export default AuthorProfile;