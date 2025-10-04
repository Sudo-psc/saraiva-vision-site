import { NextRequest } from 'next/server';
import { PersonaType } from './personas.config';

export interface RouteRewriteRule {
  source: string;
  destination: Record<PersonaType, string>;
  condition?: (req: NextRequest) => boolean;
  priority: number;
}

export const ROUTE_REWRITES: RouteRewriteRule[] = [
  {
    source: '/servicos',
    destination: {
      [PersonaType.JOVEM_ADULTO]: '/servicos/jovem',
      [PersonaType.PROFISSIONAL_SENIOR]: '/servicos/profissional',
      [PersonaType.IDOSO]: '/servicos/senior',
      [PersonaType.ATLETA]: '/servicos/atleta',
      [PersonaType.DEFAULT]: '/servicos',
    },
    priority: 100,
  },
  {
    source: '/agendar',
    destination: {
      [PersonaType.JOVEM_ADULTO]: '/agendar-online',
      [PersonaType.PROFISSIONAL_SENIOR]: '/agendar-online',
      [PersonaType.IDOSO]: '/agendar-telefone',
      [PersonaType.ATLETA]: '/agendar-online',
      [PersonaType.DEFAULT]: '/agendar',
    },
    priority: 90,
  },
];

export function getPersonalizedPath(
  originalPath: string,
  persona: PersonaType
): string {
  const rule = ROUTE_REWRITES
    .sort((a, b) => b.priority - a.priority)
    .find(r => matchPath(originalPath, r.source));
  
  if (!rule) return originalPath;
  
  return rule.destination[persona] || rule.destination[PersonaType.DEFAULT];
}

export function shouldRewrite(pathname: string, persona: PersonaType): boolean {
  if (persona === PersonaType.DEFAULT) return false;
  
  const rule = ROUTE_REWRITES.find(r => matchPath(pathname, r.source));
  
  if (!rule) return false;
  
  const personalizedPath = rule.destination[persona];
  return personalizedPath !== pathname && personalizedPath !== rule.destination[PersonaType.DEFAULT];
}

function matchPath(path: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
  return regex.test(path);
}
