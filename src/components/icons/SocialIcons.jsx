```tsx
// SocialMediaLinks.tsx - Componente para padronizar ícones de redes sociais na página da Clínica Saraiva Vision
// Responsável por: 
// - Padronizar caminhos de ícones (usando Next.js Image para otimização e responsividade)
// - Adaptabilidade multi-plataforma: responsivo com flexbox, tamanhos flexíveis via CSS (mobile-first)
// - Redes sociais: TikTok, Facebook, Instagram, Spotify, WhatsApp, Twitter (X), LinkedIn
// - Efeitos: Links clicáveis com hover (escala suave e mudança de cor/opacidade)
// - Integração com Sentry: Usando linkedErrorsIntegration para rastrear erros em links/interações (ex: cliques falhos)
// - Contexto: App React/Next.js deployado no Vercel, otimizado para saraivavision.com.br
// - Aprimoramentos: Uso de Next/Image para lazy loading e SEO; Tailwind CSS para estilos (assumindo configuração padrão no Next.js);
//   Links placeholders - substitua pelos reais da clínica; Ícones assumidos em /public/icons/ (baixe SVGs/PNGs otimizados)

import Image from 'next/image'; // Para otimização de imagens e responsividade
import Link from 'next/link'; // Para links SPA otimizados
import { linkedErrorsIntegration } from "@sentry/core"; // Integração Sentry para rastrear erros em links (ex: erros de navegação ou cliques)

// Configuração básica do Sentry (adicione ao _app.tsx ou use provider global para ativar linkedErrorsIntegration)
import * as Sentry from "@sentry/nextjs"; // Assumindo Sentry configurado no projeto Next.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // Substitua pela DSN real
  integrations: [linkedErrorsIntegration()], // Ativa rastreamento de erros em links e navegações
  // Outras configs...
});

// Definição das redes sociais com links placeholders (atualize com URLs reais da Clínica Saraiva Vision)
const socialLinks = [
  { 
    name: 'TikTok', 
    href: 'https://www.tiktok.com/@saraivavision', // Placeholder
    iconPath: '/icons/tiktok.svg', // Caminho padronizado em /public/icons/
    alt: 'TikTok da Clínica Saraiva Vision'
  },
  { 
    name: 'Facebook', 
    href: 'https://www.facebook.com/saraivavision', 
    iconPath: '/icons/facebook.svg', 
    alt: 'Facebook da Clínica Saraiva Vision'
  },
  { 
    name: 'Instagram', 
    href: 'https://www.instagram.com/saraivavision', 
    iconPath: '/icons/instagram.svg', 
    alt: 'Instagram da Clínica Saraiva Vision'
  },
  { 
    name: 'Spotify', 
    href: 'https://open.spotify.com/show/saraivavision', // Ex: podcast ou playlist da clínica
    iconPath: '/icons/spotify.svg', 
    alt: 'Spotify da Clínica Saraiva Vision'
  },
  { 
    name: 'WhatsApp', 
    href: 'https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20agendar%20uma%20consulta', // Placeholder com mensagem
    iconPath: '/icons/whatsapp.svg', 
    alt: 'WhatsApp da Clínica Saraiva Vision'
  },
  { 
    name: 'Twitter', 
    href: 'https://twitter.com/saraivavision', 
    iconPath: '/icons/twitter.svg', // Ou 'x.svg' para rebrand
    alt: 'Twitter da Clínica Saraiva Vision'
  },
  { 
    name: 'LinkedIn', 
    href: 'https://www.linkedin.com/company/saraivavision', 
    iconPath: '/icons/linkedin.svg', 
    alt: 'LinkedIn da Clínica Saraiva Vision'
  },
];

// Componente principal
const SocialMediaLinks = () => {
  // Função para lidar com cliques e rastrear erros via Sentry (opcional, para depuração)
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    try {
      // Lógica adicional se necessário (ex: analytics)
      console.log(`Clicou em: ${ href } `);
    } catch (error) {
      // Captura erros locais e integra com Sentry linkedErrors
      Sentry.captureException(error, { tags: { section: 'social-link-click' } });
    }
  };

  return (
    <div className="social-links-container">
      {/* Container flexível para responsividade multi-plataforma */}
      <ul className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 p-4 md:p-6">
        {socialLinks.map((social) => (
          <li key={social.name} className="social-icon-item">
            {/* Link com efeito hover e rastreamento de erro */}
            <Link 
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer" // Segurança para links externos
              onClick={(e) => handleLinkClick(e, social.href)}
              className="social-link inline-block transition-all duration-300 ease-in-out transform hover:scale-110 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              // Adiciona aria-label para acessibilidade
              aria-label={`Visite nosso ${ social.name } `}
            >
              {/* Ícone padronizado com Next/Image para adaptabilidade (tamanho flexível, lazy loading) */}
              <Image
                src={social.iconPath}
                alt={social.alt}
                width={32} // Tamanho base (ajusta via CSS para responsividade)
                height={32}
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" // Tamanhos responsivos: mobile (8), tablet (10), desktop (12)
                priority={false} // Não prioriza load (lazy por default)
                onError={(e) => {
                  // Rastreia erros de imagem via Sentry
                  Sentry.captureMessage(`Erro ao carregar ícone: ${ social.iconPath } `, 'error');
                }}
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Estilos CSS inline/Tailwind para efeitos e adaptabilidade (adicione ao globals.css se preferir) */}
      <style jsx>{`
    .social - links - container {
    /* Fundo opcional para seção (ex: footer da clínica) */
    background - color: #f8f9fa; /* Cor neutra para site de saúde */
    border - radius: 8px;
    margin: 1rem 0;
}
        .social - icon - item {
    list - style: none;
}
        .social - link {
    display: flex;
    align - items: center;
    justify - content: center;
    color: #333; /* Cor base */
    text - decoration: none;
}
        .social - link:hover {
    color: #007bff; /* Azul hover para links (tema médico) */
}
/* Media queries para multi-plataforma (além do Tailwind) */
@media(max - width: 640px) {
          .social - links - container ul {
        gap: 2rem; /* Mais espaço em mobile */
        justify - content: space - around;
    }
}
@media(min - width: 1024px) {
          .social - links - container {
        padding: 2rem;
    }
}
`}</style>
    </div>
  );
};

export default SocialMediaLinks;

// Como usar: Importe em uma página/componente, ex: <SocialMediaLinks /> no footer de saraivavision.com.br
// Notas: 
// - Baixe ícones SVGs otimizados (ex: de react-icons ou Font Awesome) e coloque em /public/icons/
// - Para produção no Vercel: Certifique-se de que Sentry está configurado em next.config.js
// - Teste responsividade: Funciona em desktop, tablet e mobile (flex-wrap garante quebra de linha)
// - SEO: Alt texts e links externos otimizados
// - Aprimoramento: Adicione animações CSS se necessário (ex: via framer-motion)
```