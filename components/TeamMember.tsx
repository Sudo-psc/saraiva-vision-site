'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Instagram, Facebook, Award, GraduationCap, Languages } from 'lucide-react';
import type { TeamMemberCardProps } from '@/types/team';

const TeamMember: React.FC<TeamMemberCardProps> = ({
  member,
  variant = 'default',
  showBio = true,
  showContact = false,
  className = '',
  onContactClick
}) => {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick(member);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`
        relative group
        ${isFeatured ? 'lg:col-span-2' : ''}
        ${className}
      `}
    >
      <div className={`
        bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden
        border border-slate-200/50 shadow-sm
        hover:shadow-xl hover:border-slate-300/50
        transition-all duration-300
        ${isFeatured ? 'lg:flex lg:flex-row' : ''}
      `}>
        <div className={`
          relative overflow-hidden
          ${isCompact ? 'aspect-square' : 'aspect-[3/4]'}
          ${isFeatured ? 'lg:w-1/2 lg:aspect-auto' : 'w-full'}
        `}>
          <Image
            src={member.photo}
            alt={member.photoAlt}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes={isFeatured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {member.featured && (
            <div className="absolute top-4 right-4 bg-[#1E4D4C] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Award className="w-3 h-3" />
              Destaque
            </div>
          )}
        </div>

        <div className={`
          p-6 space-y-4
          ${isFeatured ? 'lg:w-1/2 lg:p-8 lg:flex lg:flex-col lg:justify-center' : ''}
        `}>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {member.name}
            </h3>
            <p className="text-[#1E4D4C] font-semibold text-sm mb-2">
              {member.role}
              {member.specialty && ` - ${member.specialty}`}
            </p>
            {member.crm && (
              <p className="text-slate-600 text-xs font-medium">
                CRM: {member.crm}{member.crmUf && ` - ${member.crmUf}`}
              </p>
            )}
          </div>

          {showBio && (
            <p className="text-slate-700 text-sm leading-relaxed line-clamp-4">
              {member.bioExcerpt || member.bio}
            </p>
          )}

          {member.education && member.education.length > 0 && !isCompact && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4 text-[#1E4D4C]" />
                <span className="text-xs font-semibold uppercase tracking-wide">Formação</span>
              </div>
              <ul className="space-y-1 ml-6">
                {member.education.slice(0, isCompact ? 1 : 3).map((edu, idx) => (
                  <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                    {edu}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {member.languages && member.languages.length > 0 && !isCompact && (
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Languages className="w-4 h-4 text-[#1E4D4C]" />
              <span>{member.languages.join(', ')}</span>
            </div>
          )}

          {showContact && (member.email || member.phone || member.socialLinks) && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {(member.email || member.phone) && (
                <div className="flex flex-wrap gap-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#1E4D4C] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      <span className="sr-only">Email: {member.email}</span>
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#1E4D4C] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Phone className="w-4 h-4" />
                      <span className="sr-only">Telefone: {member.phone}</span>
                    </a>
                  )}
                </div>
              )}

              {member.socialLinks && (
                <div className="flex gap-3">
                  {member.socialLinks.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-[#1E4D4C] transition-colors"
                      aria-label={`LinkedIn de ${member.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks.instagram && (
                    <a
                      href={member.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-[#1E4D4C] transition-colors"
                      aria-label={`Instagram de ${member.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks.facebook && (
                    <a
                      href={member.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-[#1E4D4C] transition-colors"
                      aria-label={`Facebook de ${member.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {onContactClick && (
            <button
              onClick={handleContactClick}
              className="w-full mt-4 px-4 py-2 bg-[#1E4D4C] text-white rounded-lg font-medium text-sm hover:bg-[#163d3c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E4D4C] focus:ring-offset-2"
            >
              Agendar Consulta
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default TeamMember;
