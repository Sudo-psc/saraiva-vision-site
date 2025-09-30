import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Printer,
  Bookmark,
  ChevronUp,
  Eye,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  CheckCircle,
  Headphones
} from 'lucide-react';

// Import existing components
import Navbar from '../Navbar';
import EnhancedFooter from '../EnhancedFooter';
import { Button } from '../ui/button';
import CategoryBadge from './CategoryBadge';
import AuthorProfile from './AuthorProfile';
import ActionButtons from './ActionButtons';
import LearningSummary from './LearningSummary';
import InfoBox from './InfoBox';
import PostFAQ from './PostFAQ';
import RelatedPosts from './RelatedPosts';
import AccessibilityControls from './AccessibilityControls';
import PatientEducationSidebar from './PatientEducationSidebar';
import SpotifyEmbed from '../SpotifyEmbed';
import OptimizedImage from './OptimizedImage';

// Import data utilities
import { blogPosts, getPostBySlug } from '../../data/blogPosts';
import { getPostEnrichment } from '../../data/blogPostsEnrichment';
import { trackBlogInteraction, trackPageView } from '../../utils/analytics';

/**
 * PostPageTemplate - Premium blog post template with 3D glassmorphism design
 * Features: parallax hero, sticky TOC, scroll progress, floating actions, SEO optimized
 */
const PostPageTemplate = ({ slug }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [tocSections, setTocSections] = useState([]);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // Get post data
  const currentPost = getPostBySlug(slug);
  const enrichment = currentPost ? getPostEnrichment(currentPost.id) : null;

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Parallax effect for hero image
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    if (!currentPost) {
      navigate('/blog');
      return;
    }

    // Track page view
    trackPageView(`/blog/${currentPost.slug}`);
    trackBlogInteraction('view_post', currentPost.slug, {
      post_title: currentPost.title,
      post_category: currentPost.category,
      post_author: currentPost.author
    });

    // Extract H2 sections from content for TOC
    const parser = new DOMParser();
    const safeContent = currentPost.content || '<div></div>';
    const doc = parser.parseFromString(safeContent, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    const sections = Array.from(h2Elements).map((h2, index) => ({
      id: `section-${index}`,
      title: h2.textContent || '',
      element: h2
    }));
    setTocSections(sections);

    // Scroll event listener
    const handleScroll = () => {
      // Show scroll to top button
      setShowScrollTop(window.scrollY > 500);

      // Update active TOC section
      const scrollPosition = window.scrollY + 200;
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

  // Add IDs to H2 elements for TOC navigation
  useEffect(() => {
    if (tocSections.length > 0) {
      const contentDiv = document.querySelector('.post-content');
      if (contentDiv) {
        const h2Elements = contentDiv.querySelectorAll('h2');
        h2Elements.forEach((h2, index) => {
          h2.id = `section-${index}`;
        });
      }
    }
  }, [tocSections]);

  if (!currentPost) {
    return null;
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const readingTime = Math.ceil((currentPost.content?.length || 1000) / 1000);

  // Share handlers
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = currentPost.title;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackBlogInteraction('share', currentPost.slug, { method: 'copy_link' });
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      trackBlogInteraction('share', currentPost.slug, { method: platform });
    }

    setShareMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
    trackBlogInteraction('print', currentPost.slug);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{currentPost.seo?.metaTitle || currentPost.title} | Saraiva Vision</title>
        <meta name="description" content={currentPost.seo?.metaDescription || currentPost.excerpt} />
        <meta name="keywords" content={currentPost.seo?.keywords?.join(', ') || currentPost.tags?.join(', ')} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={currentPost.title} />
        <meta property="og:description" content={currentPost.excerpt} />
        <meta property="og:image" content={currentPost.image} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={currentPost.title} />
        <meta property="twitter:description" content={currentPost.excerpt} />
        <meta property="twitter:image" content={currentPost.image} />

        {/* Schema.org MedicalArticle */}
        <script type="application/ld+json">
          {JSON.stringify({
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
              "jobTitle": "Oftalmologista"
            },
            "publisher": {
              "@type": "MedicalOrganization",
              "name": "Saraiva Vision",
              "logo": {
                "@type": "ImageObject",
                "url": "https://saraivavision.com.br/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            }
          })}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar />

      <main className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumbs with Glass Effect */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-md rounded-xl px-4 py-3 shadow-md border border-white/50 inline-flex"
            >
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to="/blog" className="hover:text-blue-600 transition-colors font-medium">
                    Blog
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-semibold truncate max-w-xs" title={currentPost.title}>
                  {currentPost.title}
                </li>
              </ol>
            </motion.div>
          </nav>

          {/* Back Button with 3D Effect */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 relative inline-block group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <Button
              onClick={() => navigate('/blog')}
              variant="ghost"
              className="relative bg-white/60 backdrop-blur-md border-2 border-white/50 hover:bg-white/80 shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o blog
            </Button>
          </motion.div>

          {/* Hero Section with Parallax */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Hero Image with Parallax */}
            {currentPost.image && (
              <motion.div
                style={{ y: heroY, opacity: heroOpacity }}
                className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
              >
                <OptimizedImage
                  src={currentPost.image}
                  alt={`${currentPost.title} - Saraiva Vision`}
                  className="w-full h-full"
                  loading="eager"
                  aspectRatio="16/9"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </motion.div>
            )}

            {/* Hero Content - Overlayed on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
              <div className="max-w-4xl">
                {/* Category Badge with Glass Effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="inline-block bg-white/20 backdrop-blur-md rounded-full p-1">
                    <CategoryBadge category={currentPost.category} size="lg" />
                  </div>
                </motion.div>

                {/* Title with 3D Glass Effect */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1)'
                  }}
                >
                  {currentPost.title}
                </motion.h1>

                {/* Meta Information with Glass Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  {/* Author */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg">
                    <User className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-sm">
                      {currentPost.author || 'Dr. Philipe Saraiva'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg">
                    <Calendar className="w-4 h-4 text-white" />
                    <time dateTime={currentPost.date} className="text-white font-medium text-sm">
                      {formatDate(currentPost.date)}
                    </time>
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">
                      {readingTime} min de leitura
                    </span>
                  </div>

                  {/* Views (simulated) */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">
                      {Math.floor(Math.random() * 500) + 100} visualizações
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <article className="lg:col-span-8 space-y-8">
              {/* Learning Summary */}
              {enrichment?.learningPoints && (
                <LearningSummary items={enrichment.learningPoints} />
              )}

              {/* Post Content with Glass Effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative group"
              >
                {/* 3D Shadow Layer */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content Container */}
                <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-white/50">
                  {/* Liquid Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>

                  {/* Content with Typography Plugin */}
                  <div
                    className="relative prose prose-lg lg:prose-xl max-w-none post-content"
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                  />
                </div>
              </motion.div>

              {/* Info Boxes/Warnings */}
              {enrichment?.warnings && enrichment.warnings.map((warning, index) => (
                <InfoBox
                  key={index}
                  type={warning.type}
                  title={warning.title}
                >
                  <p>{warning.content}</p>
                </InfoBox>
              ))}

              {/* Tags Section */}
              {currentPost.tags && currentPost.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏷️</span>
                    <span>Tags Relacionadas</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {currentPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-sm font-semibold border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Related Podcasts Section */}
              {currentPost.relatedPodcasts && currentPost.relatedPodcasts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative group"
                >
                  {/* 3D Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                  <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md">
                        <Headphones className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Podcasts Relacionados
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ouça nossos episódios sobre este tema
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {currentPost.relatedPodcasts.map((podcast, index) => (
                        <div
                          key={podcast.id || index}
                          className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-blue-600">🎙️</span>
                            {podcast.title}
                          </h4>

                          {podcast.spotifyShowId ? (
                            <SpotifyEmbed
                              type="show"
                              id={podcast.spotifyShowId}
                              className="mb-0"
                            />
                          ) : podcast.spotifyEpisodeId ? (
                            <SpotifyEmbed
                              type="episode"
                              id={podcast.spotifyEpisodeId}
                              className="mb-0"
                            />
                          ) : (
                            <div className="text-center py-4">
                              <a
                                href={podcast.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full transition-colors"
                              >
                                <Headphones className="w-5 h-5" />
                                Ouvir no Spotify
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-blue-200">
                      <p className="text-sm text-gray-600 text-center">
                        <a
                          href="/podcast"
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Ver todos os episódios do podcast
                        </a>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FAQ Section */}
              {enrichment?.faq && (
                <PostFAQ questions={enrichment.faq} />
              )}

              {/* Social Share Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 shadow-xl text-white"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>Gostou? Compartilhe este artigo!</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleShare('twitter')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare('facebook')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => handleShare('linkedin')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => handleShare('copy')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
                <Button
                  onClick={() => navigate('/blog')}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-md border-2 border-white/50 hover:bg-white/80 shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ver todos os posts
                </Button>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {tocSections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <span>📑</span>
                      <span>Índice</span>
                    </h3>
                    <nav aria-label="Índice do artigo">
                      <ul className="space-y-2">
                        {tocSections.map((section, index) => (
                          <li key={section.id}>
                            <button
                              onClick={() => scrollToSection(section.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                activeSection === section.id
                                  ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              {section.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </motion.div>
                )}

                {/* Author Profile */}
                <AuthorProfile showContact={false} />

                {/* Action Buttons */}
                <ActionButtons
                  showAppointment={true}
                  showContact={true}
                  showPDF={false}
                />

                {/* Patient Education Sidebar */}
                <PatientEducationSidebar />
              </div>
            </aside>
          </div>

          {/* Related Posts - Full Width */}
          <RelatedPosts
            posts={blogPosts}
            currentPostId={currentPost.id}
          />
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        {/* Scroll to Top */}
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            className="group relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all"
            aria-label="Voltar ao topo"
          >
            {/* 3D Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <ChevronUp className="relative w-6 h-6" />
          </motion.button>
        )}

        {/* Share Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className="group relative p-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all"
            aria-label="Compartilhar"
          >
            {/* 3D Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <Share2 className="relative w-6 h-6" />
          </motion.button>

          {/* Share Menu */}
          {shareMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-full right-0 mb-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 p-3 min-w-[200px]"
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-sm text-gray-700 font-medium"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-sm text-gray-700 font-medium"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-sm text-gray-700 font-medium"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-sm text-gray-700 font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Print Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="group relative p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all"
          aria-label="Imprimir"
        >
          {/* 3D Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <Printer className="relative w-6 h-6" />
        </motion.button>
      </div>

      {/* Accessibility Controls */}
      <AccessibilityControls />

      <EnhancedFooter />
    </div>
  );
};

export default PostPageTemplate;
