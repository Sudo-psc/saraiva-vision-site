import { useState, useEffect } from 'react';
import '../../styles/blog-post-layout.css';
import { Link, useNavigate } from '@/utils/router';
import { motion, useScroll } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Copy,
  CheckCircle,
  MapPin,
  Phone,
  ExternalLink,
  ChevronRight,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';

import Navbar from '../Navbar';
import EnhancedFooter from '../EnhancedFooter';
import { Button } from '../ui/button';
import CategoryBadge from './CategoryBadge';
import RelatedPosts from './RelatedPosts';
import OptimizedImage from './OptimizedImage';
import SpotifyEmbed from '../SpotifyEmbed';
import CookieConsentModal from '../CookieConsentModal';

import { blogPosts, getPostBySlug } from '../../content/blog';
import { getPostEnrichment } from '../../data/blogPostsEnrichment';
import { trackBlogInteraction, trackPageView } from '../../utils/analytics';

const PostPageTemplateRefactored = ({ slug }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [tocSections, setTocSections] = useState([]);
  const [showCookieModal, setShowCookieModal] = useState(false);

  const currentPost = getPostBySlug(slug);
  const enrichment = currentPost ? getPostEnrichment(currentPost.id) : null;

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!currentPost) {
      navigate('/blog');
      return;
    }

    trackPageView(`/blog/${currentPost.slug}`);
    trackBlogInteraction('view_post', currentPost.slug, {
      post_title: currentPost.title,
      post_category: currentPost.category,
      post_author: currentPost.author
    });

    const parser = new DOMParser();
    const safeContent = currentPost.content || '<div></div>';
    const doc = parser.parseFromString(safeContent, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    const sections = Array.from(h2Elements).map((h2, index) => ({
      id: `section-${index}`,
      title: h2.textContent.replace(/^[📊🔍✨📈📋⚠️✅❌💡🎯]/g, '').trim()
    }));
    setTocSections(sections);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(`section-${i}`);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(`section-${i}`);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPost, navigate]);

  useEffect(() => {
    if (tocSections.length > 0) {
      const contentDiv = document.querySelector('.post-content');
      if (contentDiv) {
        const h2Elements = contentDiv.querySelectorAll('h2');
        h2Elements.forEach((h2, index) => {
          h2.id = `section-${index}`;
          h2.style.scrollMarginTop = '120px';
        });
      }
    }
  }, [tocSections]);

  if (!currentPost) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const readingTime = Math.ceil((currentPost.content?.length || 1000) / 1000);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = currentPost.title;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      trackBlogInteraction('share', currentPost.slug, { method: 'copy_link' });
    } else {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
      trackBlogInteraction('share', currentPost.slug, { method: platform });
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clinicInfo = {
    name: 'Saraiva Vision',
    crm: 'CRM-MG 69.870',
    cnpj: '53.864.119/0001-79',
    phone: '+55 33 99860-1427',
    phoneDisplay: '(33) 99860-1427',
    address: 'Rua Catarina Maria Passos, 97 – Santa Zita',
    city: 'Caratinga/MG',
    cep: 'CEP 35300-299',
    mapsUrl: 'https://maps.app.goo.gl/HEiqAqZ3yLECBgeD8',
    whatsappUrl: 'https://wa.me/5533998601427?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20consulta'
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": currentPost.title,
    "description": currentPost.excerpt,
    "image": currentPost.image,
    "datePublished": currentPost.date,
    "dateModified": currentPost.updatedAt || currentPost.date,
    "author": {
      "@type": "Person",
      "name": currentPost.author || "Dr. Philipe Saraiva Cruz",
      "jobTitle": "Oftalmologista",
      "identifier": "CRM-MG 69.870"
    },
    "publisher": {
      "@type": "MedicalOrganization",
      "name": clinicInfo.name,
      "telephone": clinicInfo.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinicInfo.address,
        "addressLocality": "Caratinga",
        "addressRegion": "MG",
        "postalCode": "35300-299",
        "addressCountry": "BR"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : ''
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": clinicInfo.name,
    "identifier": clinicInfo.cnpj,
    "telephone": clinicInfo.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinicInfo.address,
      "addressLocality": "Caratinga",
      "addressRegion": "MG",
      "postalCode": "35300-299",
      "addressCountry": "BR"
    },
    "url": "https://saraivavision.com.br",
    "sameAs": [
      "https://www.instagram.com/saraivavisao/",
      "https://www.facebook.com/saraivavisao"
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{currentPost.seo?.metaTitle || currentPost.title} | Saraiva Vision</title>
        <meta name="description" content={currentPost.seo?.metaDescription || currentPost.excerpt} />
        <meta name="keywords" content={currentPost.seo?.keywords?.join(', ') || currentPost.tags?.join(', ')} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={currentPost.title} />
        <meta property="og:description" content={currentPost.excerpt} />
        <meta property="og:image" content={currentPost.image} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentPost.title} />
        <meta name="twitter:description" content={currentPost.excerpt} />
        <meta name="twitter:image" content={currentPost.image} />

        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      <Navbar />

      <main className="py-24 md:py-32" role="main">
        <div className="container mx-auto px-3 md:px-4 lg:px-6 max-w-[1600px]">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-600">
              <li><Link to="/" className="hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded">Início</Link></li>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <li><Link to="/blog" className="hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded">Blog</Link></li>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <li aria-current="page" className="text-slate-900 font-medium truncate max-w-md">{currentPost.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-8">
              <header className="mb-8">
                <CategoryBadge category={currentPost.category} />
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                  {currentPost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    <span>{currentPost.author || 'Dr. Philipe Saraiva Cruz'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    <time dateTime={currentPost.date}>{formatDate(currentPost.date)}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    <span>{readingTime} min de leitura</span>
                  </div>
                </div>

                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  {currentPost.excerpt}
                </p>

                {currentPost.image && (
                  <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                    <OptimizedImage
                      src={currentPost.image}
                      alt={currentPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </header>

              <div
                className="post-content prose prose-lg prose-slate max-w-none
                  prose-headings:text-slate-900 prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline focus:prose-a:outline-none focus:prose-a:ring-2 focus:prose-a:ring-teal-500 focus:prose-a:ring-offset-2
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                  prose-li:text-slate-700 prose-li:mb-2
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />

              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Compartilhar artigo</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Compartilhar no Facebook"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-sky-600 hover:bg-sky-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        aria-label="Compartilhar no Twitter"
                      >
                        <Twitter className="w-5 h-5 text-sky-600" />
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-700 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                        aria-label="Compartilhar no LinkedIn"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        aria-label="Copiar link"
                      >
                        {copied ? <CheckCircle className="w-5 h-5 text-teal-600" /> : <Copy className="w-5 h-5 text-slate-600" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {enrichment?.relatedPodcasts && enrichment.relatedPodcasts.length > 0 && (
                <section className="mt-12 bg-white border border-slate-200 rounded-xl p-6" aria-labelledby="podcast-section">
                  <h2 id="podcast-section" className="text-xl font-bold text-slate-900 mb-4">Ouça mais sobre este tema</h2>
                  {enrichment.relatedPodcasts.map((podcast) => (
                    <SpotifyEmbed key={podcast.id} showId={podcast.spotifyShowId} />
                  ))}
                </section>
              )}

              <aside className="mt-12 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6" aria-labelledby="clinic-info">
                <h2 id="clinic-info" className="text-xl font-bold text-slate-900 mb-4">Agende sua consulta</h2>
                <div className="space-y-3 mb-6 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
                    <span>{clinicInfo.address}, {clinicInfo.city}, {clinicInfo.cep}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
                    <a href={`tel:${clinicInfo.phone}`} className="hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded">
                      {clinicInfo.phoneDisplay}
                    </a>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={clinicInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                    Agendar consulta
                  </a>
                  <a
                    href={clinicInfo.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ExternalLink className="w-5 h-5" aria-hidden="true" />
                    Ver no Google Maps
                  </a>
                </div>
              </aside>

              <footer className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>{clinicInfo.crm}</span>
                  <span aria-hidden="true">•</span>
                  <span>CNPJ {clinicInfo.cnpj}</span>
                  <span aria-hidden="true">•</span>
                  <span>Parceiro Amor e Saúde</span>
                </div>
              </footer>

              <div className="mt-8">
                <Button
                  onClick={() => navigate('/blog')}
                  variant="outline"
                  className="inline-flex items-center gap-2 border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Ver todos os posts
                </Button>
              </div>
            </article>

            <aside className="lg:col-span-4" role="complementary" aria-label="Informações adicionais">
              <div className="sticky top-24 space-y-6">
                {tocSections.length > 0 && (
                  <nav className="bg-white border border-slate-200 rounded-xl p-6" aria-labelledby="toc-heading">
                    <h2 id="toc-heading" className="font-bold text-slate-900 mb-4 text-lg">Índice</h2>
                    <ul className="space-y-2">
                      {tocSections.map((section) => (
                        <li key={section.id}>
                          <button
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                              activeSection === section.id
                                ? 'bg-teal-100 text-teal-900 font-semibold border-l-4 border-teal-600'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {section.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      PS
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Dr. Philipe Saraiva Cruz</h3>
                      <p className="text-sm text-slate-600 mt-1">Oftalmologista</p>
                      <p className="text-xs text-slate-500 mt-1">CRM-MG 69.870</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-16">
            <RelatedPosts posts={blogPosts} currentPostId={currentPost.id} />
          </div>
        </div>
      </main>

      <EnhancedFooter onManageCookies={() => setShowCookieModal(true)} />
      
      {showCookieModal && (
        <CookieConsentModal onClose={() => setShowCookieModal(false)} />
      )}
    </div>
  );
};

export default PostPageTemplateRefactored;
