/**
 * Podcast Transcript Component
 * SEO-optimized transcript with keywords highlighting and internal links
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Tag, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Type definitions for type safety
const HighlightType = {
  timestamp: '',
  text: '',
  keywords: []
};

interface Transcript {
  summary: string;
  keywords?: string[];
  highlights?: Highlight[];
  fullTranscript: string;
}

interface RelatedService {
  title: string;
  url: string;
  icon: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
}

interface Episode {
  transcript?: Transcript;
  relatedServices?: RelatedService[];
  relatedPosts?: RelatedPost[];
}

interface PodcastTranscriptProps {
  episode: Episode;
}

const PodcastTranscript: React.FC<PodcastTranscriptProps> = ({ episode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);

  if (!episode?.transcript) {
    return null;
  }

  const { summary, keywords, highlights, fullTranscript } = episode.transcript;

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-primary-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Transcrição do Episódio</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors"
            aria-label={isExpanded ? "Ocultar transcrição" : "Expandir transcrição"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                <span className="hidden sm:inline">Ocultar</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span className="hidden sm:inline">Expandir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <h4 className="text-sm font-semibold text-primary-700 mb-2 uppercase tracking-wide">Resumo</h4>
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
              Palavras-chave Locais
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors cursor-default"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights Toggle */}
      {highlights && highlights.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>{showHighlights ? 'Ocultar' : 'Mostrar'} Destaques</span>
            {showHighlights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Highlights */}
      <AnimatePresence>
        {showHighlights && highlights && highlights.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-primary-100"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {highlight.timestamp}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed mb-2">{highlight.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {highlight.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white text-primary-700 rounded-md text-xs font-medium border border-primary-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Transcript */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-6 bg-white">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-primary-700 prose-headings:font-bold
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-primary-800 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                  prose-li:text-gray-700 prose-li:mb-2
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: fullTranscript }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Services */}
      {episode.relatedServices && episode.relatedServices.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
              Serviços Relacionados
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {episode.relatedServices.map((service, index) => (
              <Link
                key={index}
                to={service.url}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-primary-50 rounded-xl border border-primary-200 hover:border-primary-400 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="p-2 bg-primary-100 group-hover:bg-primary-200 rounded-lg transition-colors">
                  {service.icon === 'stethoscope' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {service.icon === 'eye' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {service.icon === 'clipboard' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {service.icon === 'scissors' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                  )}
                  {service.icon === 'droplet' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  )}
                  {service.icon === 'search' && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors">
                  {service.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Blog Posts */}
      {episode.relatedPosts && episode.relatedPosts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <h4 className="text-sm font-semibold text-primary-700 mb-3 uppercase tracking-wide">
            Artigos Relacionados no Blog
          </h4>
          <div className="space-y-2">
            {episode.relatedPosts.map((post, index) => (
              <Link
                key={index}
                to={`/blog/${post.slug}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-primary-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors">
                  {post.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

PodcastTranscript.propTypes = {
  episode: PropTypes.shape({
    transcript: PropTypes.shape({
      summary: PropTypes.string.isRequired,
      keywords: PropTypes.arrayOf(PropTypes.string),
      highlights: PropTypes.arrayOf(PropTypes.shape({
        timestamp: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string)
      })),
      fullTranscript: PropTypes.string.isRequired
    }),
    relatedServices: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    })),
    relatedPosts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    }))
  }).isRequired
};

export default PodcastTranscript;
