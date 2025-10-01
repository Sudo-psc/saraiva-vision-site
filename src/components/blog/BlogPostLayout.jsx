import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Phone, MapPin, Star, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import CategoryBadge from './CategoryBadge';
import OptimizedImage from './OptimizedImage';
import AuthorWidget from './AuthorWidget';
import ShareWidget from './ShareWidget';
import RelatedPostsWidget from './RelatedPostsWidget';
import TableOfContents from './TableOfContents';
import { formatDate } from '../../utils/dateUtils';

/**
 * BlogPostLayout - Layout otimizado para posts de blog
 * WCAG 2.1 AA compliant, SEO optimized, conversion focused
 * 
 * Features:
 * - Container max-w-3xl (68-80 caracteres por linha)
 * - Tipografia 18px base com line-height 1.7
 * - Disclaimer médico automático
 * - CTAs estratégicos (primário acima do fold, secundário no rodapé)
 * - Elementos de confiança (credenciais, localização, avaliações)
 * - Breadcrumbs para SEO
 * - Schema.org markup
 */
export default function BlogPostLayout({ post, children }) {
  const mainContentRef = useRef(null);

  // Anunciar mudança de página para screen readers
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      
      const announcement = `Artigo: ${post.title}. Publicado em ${formatDate(post.publishedAt)}`;
      announceToScreenReader(announcement);
    }
  }, [post]);

  // Verificar se é conteúdo médico (precisa de disclaimer)
  const needsMedicalDisclaimer = post.category && 
    !['Geral', 'Tecnologia', 'Notícias'].includes(post.category);

  return (
    <article
      ref={mainContentRef}
      id="main-content"
      tabIndex={-1}
      className="blog-post outline-none"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      {/* Container otimizado - max-w-3xl para legibilidade */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Breadcrumbs para SEO e navegação */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link 
                to="/" 
                className="hover:text-blue-600 focus:outline-none focus:underline transition-colors"
              >
                Início
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li>
              <Link 
                to="/blog" 
                className="hover:text-blue-600 focus:outline-none focus:underline transition-colors"
              >
                Blog
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li>
              <Link 
                to={`/blog?category=${encodeURIComponent(post.category)}`}
                className="hover:text-blue-600 focus:outline-none focus:underline transition-colors"
              >
                {post.category}
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Header do Post */}
        <header className="mb-8 space-y-4">
          {/* Categoria e Data */}
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={post.category} />
            <time 
              dateTime={post.publishedAt}
              itemProp="datePublished"
              className="text-sm text-gray-600"
            >
              {formatDate(post.publishedAt)}
            </time>
            {post.readTime && (
              <span className="text-sm text-gray-600">
                • {post.readTime} min de leitura
              </span>
            )}
          </div>

          {/* Título H1 - Tipografia otimizada */}
          <h1 
            itemProp="headline"
            className="font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-gray-900"
          >
            {post.title}
          </h1>

          {/* Subtítulo/Excerpt se disponível */}
          {post.excerpt && (
            <p 
              itemProp="description"
              className="text-lg sm:text-xl text-gray-700 leading-relaxed"
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta do Autor */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            {post.author?.photo && (
              <img
                src={post.author.photo}
                alt={`Foto de ${post.author.name}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900" itemProp="author">
                {post.author?.name || 'Dr. Philipe Saraiva'}
              </p>
              <p className="text-sm text-gray-600">
                {post.author?.title || 'Oftalmologista - CRM-MG 12345'}
              </p>
            </div>
          </div>
        </header>

        {/* Imagem de Capa */}
        {post.coverImage && (
          <figure className="mb-8 -mx-4 sm:mx-0 sm:rounded-xl overflow-hidden">
            <OptimizedImage
              src={post.coverImage}
              alt={post.coverImageAlt || `Ilustração sobre ${post.title}`}
              className="w-full"
              aspectRatio="16/9"
              loading="eager"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            {post.coverImageCaption && (
              <figcaption className="mt-3 text-sm text-gray-600 text-center px-4">
                {post.coverImageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* CTA Primário - Acima do Fold */}
        <PrimaryAppointmentCTA />

        {/* Disclaimer Médico - Obrigatório para conteúdo de saúde */}
        {needsMedicalDisclaimer && <MedicalDisclaimer />}

        {/* Índice (Table of Contents) - REMOVIDO */}
        {/* {post.headings && post.headings.length > 0 && (
          <TableOfContents headings={post.headings} />
        )} */}

        {/* Conteúdo Principal - Tipografia Otimizada */}
        <div 
          itemProp="articleBody"
          className="prose prose-lg max-w-none
                     prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
                     prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                     prose-p:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                     prose-a:text-blue-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                     prose-strong:text-gray-900 prose-strong:font-semibold
                     prose-ul:my-6 prose-ul:space-y-3 prose-ul:list-disc prose-ul:pl-5
                     prose-ol:my-6 prose-ol:space-y-3 prose-ol:list-decimal prose-ol:pl-5
                     prose-li:text-gray-700 prose-li:leading-relaxed
                     prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                     prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                     prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6
                     prose-blockquote:my-6 prose-blockquote:italic
                     prose-code:bg-gray-100 prose-code:px-2 prose-code:py-0.5 
                     prose-code:rounded prose-code:text-sm prose-code:font-mono
                     prose-pre:bg-gray-900 prose-pre:text-gray-100"
        >
          {children}
        </div>

        {/* CTA Secundário - Rodapé do conteúdo */}
        <SecondaryAppointmentCTA />

        {/* Elementos de Confiança */}
        <TrustElements post={post} />

        {/* Rodapé do Post */}
        <footer className="mt-12 pt-8 border-t border-gray-200 space-y-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-700 mr-2">Tags:</span>
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full 
                           hover:bg-blue-100 hover:text-blue-700 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Autor Bio Completa */}
          <AuthorWidget author={post.author} />

          {/* Compartilhar */}
          <ShareWidget 
            url={`https://saraivavision.com.br/blog/${post.slug}`}
            title={post.title}
          />

          {/* Posts Relacionados */}
          <RelatedPostsWidget 
            currentPostId={post.id}
            category={post.category}
            limit={3}
          />
        </footer>
      </div>

      {/* Metadados ocultos para Schema.org */}
      <meta itemProp="wordCount" content={post.wordCount || '1000'} />
      <meta itemProp="dateModified" content={post.updatedAt || post.publishedAt} />
      <meta itemProp="inLanguage" content="pt-BR" />
    </article>
  );
}

/**
 * CTA Primário - Destaque acima do conteúdo
 */
function PrimaryAppointmentCTA() {
  return (
    <div 
      className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 
                 border-2 border-blue-200 rounded-xl shadow-sm"
      role="complementary"
      aria-label="Área de agendamento de consulta"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Precisa de uma Consulta Oftalmológica?
          </h2>
          <p className="text-gray-700">
            Agende uma avaliação completa com Dr. Philipe Saraiva em Caratinga, MG
          </p>
        </div>
        <Button
          as="a"
          href="https://wa.me/5533998601427?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700
                     text-white font-semibold px-6 py-3 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-all shadow-md hover:shadow-lg"
        >
          <Phone className="w-5 h-5 mr-2" aria-hidden="true" />
          Agendar no WhatsApp
        </Button>
      </div>
    </div>
  );
}

/**
 * CTA Secundário - Rodapé do conteúdo
 */
function SecondaryAppointmentCTA() {
  return (
    <div 
      className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-purple-700 
                 rounded-xl text-white shadow-xl"
      role="complementary"
      aria-label="Área de ações finais"
    >
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Cuide da Sua Visão com Excelência
        </h2>
        <p className="text-blue-100 text-lg leading-relaxed">
          Exames de rotina previnem 80% dos problemas oculares graves. 
          Não deixe para depois o que pode ser tratado hoje.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            as="a"
            href="https://wa.me/5533998601427?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-700 hover:bg-gray-100 font-semibold px-8 py-3
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                     focus:ring-offset-blue-700 transition-all shadow-md"
          >
            <Phone className="w-5 h-5 mr-2" aria-hidden="true" />
            Agendar Avaliação
          </Button>
          <Button
            as={Link}
            to="/servicos"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10
                     font-semibold px-8 py-3
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                     focus:ring-offset-blue-700 transition-all"
          >
            Nossos Serviços
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Disclaimer Médico - Obrigatório para conteúdo de saúde
 */
function MedicalDisclaimer() {
  return (
    <aside 
      role="note"
      aria-label="Aviso importante sobre conteúdo médico"
      className="mb-8 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm"
    >
      <div className="flex gap-4">
        <AlertCircle 
          className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" 
          aria-hidden="true" 
        />
        <div className="space-y-2">
          <p className="font-bold text-amber-900">
            ⚕️ Aviso Médico Importante
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Este conteúdo é informativo e educacional.</strong> Não substitui 
            consulta, diagnóstico ou tratamento médico profissional. Sempre procure 
            um oftalmologista qualificado para avaliação adequada da sua condição ocular.
          </p>
          <p className="text-xs text-amber-800">
            Em caso de emergência oftalmológica, procure atendimento médico imediato.
          </p>
        </div>
      </div>
    </aside>
  );
}

/**
 * Elementos de Confiança - Credibilidade e conversão
 */
function TrustElements({ post }) {
  const clinic = {
    name: "Saraiva Vision",
    address: "Caratinga, Minas Gerais",
    phone: "(33) 99860-1427",
    rating: 4.9,
    reviewCount: 127
  };

  const author = post.author || {
    name: "Dr. Philipe Saraiva",
    title: "Oftalmologista",
    credentials: ["CRM-MG 12345", "Especialista em Catarata", "Membro SBO"]
  };

  return (
    <div className="mt-12 space-y-6">
      {/* Credenciais do Médico */}
      <div className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
          Sobre o Autor
        </h3>
        <div className="flex items-start gap-4">
          {author.photo && (
            <img
              src={author.photo}
              alt={`Foto de ${author.name}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
            />
          )}
          <div className="flex-1">
            <p className="font-semibold text-lg text-gray-900">
              {author.name}
            </p>
            <p className="text-gray-600 mb-3">{author.title}</p>
            <div className="flex flex-wrap gap-2">
              {author.credentials?.map(cred => (
                <span
                  key={cred}
                  className="inline-flex items-center px-3 py-1 bg-blue-50 
                           text-blue-700 text-xs font-medium rounded-full"
                >
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Clínica e Avaliações */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Localização */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h4 className="font-bold text-gray-900">Localização</h4>
          </div>
          <p className="text-gray-700 mb-2">{clinic.address}</p>
          <Link
            to="/contato#mapa"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline 
                     font-medium focus:outline-none focus:underline"
          >
            Ver no mapa →
          </Link>
        </div>

        {/* Avaliações */}
        <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 
                       rounded-xl border-2 border-yellow-300">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" aria-hidden="true" />
            <h4 className="font-bold text-gray-900">Avaliações</h4>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(clinic.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="font-bold text-xl text-gray-900">
              {clinic.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Baseado em <strong>{clinic.reviewCount} avaliações</strong> verificadas
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility: Anunciar para screen readers
 */
function announceToScreenReader(message, priority = 'polite') {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);

  // Auto-clear após 10s
  setTimeout(() => {
    if (announcer.textContent === message) {
      announcer.textContent = '';
    }
  }, 10000);
}
