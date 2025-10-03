/**
 * Podcast Transcript Component - Next.js 15
 * SEO-optimized transcript with keywords highlighting and internal links
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Tag, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import type { PodcastTranscriptProps } from '@/types/podcast';

export default function PodcastTranscript({
  episode,
  className = '',
  defaultExpanded = false,
  enableSearch = true,
}: PodcastTranscriptProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showHighlights, setShowHighlights] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (!episode?.transcript) {
    return null;
  }

  const { summary, keywords, highlights, fullTranscript } = episode.transcript;

  // Filter highlights based on search query
  const filteredHighlights =
    enableSearch && searchQuery
      ? highlights?.filter(
          (h) => h.text.toLowerCase().includes(searchQuery.toLowerCase()) || h.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : highlights;

  return (
    <div className={`bg-white rounded-3xl shadow-xl border-2 border-primary-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Transcrição do Episódio</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isExpanded ? 'Ocultar transcrição' : 'Expandir transcrição'}
            aria-expanded={isExpanded}
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
            <Tag className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Palavras-chave Locais</h4>
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

      {/* Search Bar */}
      {enableSearch && highlights && highlights.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar nos destaques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Buscar nos destaques do episódio"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Limpar busca"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Highlights Toggle */}
      {highlights && highlights.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
            aria-label={showHighlights ? 'Ocultar destaques' : 'Mostrar destaques'}
            aria-expanded={showHighlights}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{showHighlights ? 'Ocultar' : 'Mostrar'} Destaques</span>
            {showHighlights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Highlights */}
      {showHighlights && filteredHighlights && filteredHighlights.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            {filteredHighlights.map((highlight, index) => (
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
        </div>
      )}

      {/* No results message */}
      {enableSearch && searchQuery && filteredHighlights && filteredHighlights.length === 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <p className="text-gray-600">Nenhum destaque encontrado para "{searchQuery}"</p>
        </div>
      )}

      {/* Full Transcript */}
      {isExpanded && (
        <div className="border-t border-gray-200">
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
        </div>
      )}

      {/* Related Services */}
      {episode.relatedServices && episode.relatedServices.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Serviços Relacionados</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {episode.relatedServices.map((service, index) => (
              <Link
                key={index}
                href={service.url}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-primary-50 rounded-xl border border-primary-200 hover:border-primary-400 transition-all duration-300 group shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="p-2 bg-primary-100 group-hover:bg-primary-200 rounded-lg transition-colors">
                  {/* Icon placeholder - using generic eye icon */}
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
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
                href={`/blog/${post.slug}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg
                  className="w-5 h-5 text-primary-500 group-hover:text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors">{post.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
