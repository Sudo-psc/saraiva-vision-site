'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users } from 'lucide-react';
import TeamMember from './TeamMember';
import type { TeamGridProps, TeamMember as TeamMemberType } from '@/types/team';

const TeamGrid: React.FC<TeamGridProps> = ({
  members,
  showFilters = false,
  showSearch = false,
  columns = 3,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();
    members.forEach(member => {
      if (member.specialty) {
        uniqueSpecialties.add(member.specialty);
      }
    });
    return Array.from(uniqueSpecialties).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchQuery === '' || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialty === 'all' || 
        member.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [members, searchQuery, selectedSpecialty]);

  const featuredMembers = filteredMembers.filter(m => m.featured);
  const regularMembers = filteredMembers.filter(m => !m.featured);

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {(showSearch || showFilters) && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-[#1E4D4C] focus:ring-2 focus:ring-[#1E4D4C]/20 outline-none transition-all"
                  aria-label="Buscar profissionais"
                />
              </div>
            )}

            {showFilters && specialties.length > 0 && (
              <div className="relative sm:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-[#1E4D4C] focus:ring-2 focus:ring-[#1E4D4C]/20 outline-none transition-all appearance-none bg-white cursor-pointer"
                  aria-label="Filtrar por especialidade"
                >
                  <option value="all">Todas as especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>
              {filteredMembers.length} {filteredMembers.length === 1 ? 'profissional' : 'profissionais'}
              {searchQuery || selectedSpecialty !== 'all' ? ' encontrado(s)' : ''}
            </span>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Nenhum profissional encontrado
          </h3>
          <p className="text-slate-500">
            Tente ajustar os filtros de busca
          </p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {featuredMembers.length > 0 && (
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"
              >
                <span className="text-[#1E4D4C]">★</span>
                Profissionais em Destaque
              </motion.h3>
              <div className={`grid ${gridCols[columns]} gap-6`}>
                {featuredMembers.map((member, index) => (
                  <TeamMember
                    key={member.id}
                    member={member}
                    variant="featured"
                    showBio={true}
                    showContact={false}
                  />
                ))}
              </div>
            </div>
          )}

          {regularMembers.length > 0 && (
            <div>
              {featuredMembers.length > 0 && (
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-slate-900 mb-6"
                >
                  Nossa Equipe
                </motion.h3>
              )}
              <div className={`grid ${gridCols[columns]} gap-6`}>
                {regularMembers.map((member, index) => (
                  <TeamMember
                    key={member.id}
                    member={member}
                    variant="default"
                    showBio={true}
                    showContact={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamGrid;
