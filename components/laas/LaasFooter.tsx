'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { LAAS_CNPJ, LAAS_CRM_MEDICO } from '@/lib/laas/config';

export function LaasFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Coluna 1: Informações da clínica */}
          <div>
            <h3 className="font-bold mb-4">Saraiva Vision</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Rua Coronel Antônio Ponciano, 303 - Centro, Caratinga/MG</span>
              </li>
              <li>
                <strong className="text-gray-300">CNPJ:</strong> {LAAS_CNPJ || '[PARAMETRO: CNPJ_CLINICA]'}
              </li>
            </ul>
          </div>

          {/* Coluna 2: Links legais */}
          <div>
            <h3 className="font-bold mb-4">Informações Legais</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-privacidade" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-uso" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/lgpd" className="text-gray-400 hover:text-white transition-colors">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Responsável técnico */}
          <div>
            <h3 className="font-bold mb-4">Responsável Técnico</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>
                <strong className="text-gray-300">Diretor Técnico:</strong> Dr. Saraiva
              </li>
              <li>
                <strong className="text-gray-300">CRM:</strong> {LAAS_CRM_MEDICO || '[PARAMETRO: CRM_MEDICO]'}
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} Saraiva Vision. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
