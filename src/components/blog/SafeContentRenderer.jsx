import React from 'react';
import { BlogContentProcessor, IS_DEVELOPMENT } from '../../utils/blogDebug';

/**
 * SafeContentRenderer - Safely renders HTML content with error handling
 */
const SafeContentRenderer = ({ content, className = '', fallback = null }) => {
  // Safe content processing with error boundary
  const [renderError, setRenderError] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (content) {
      setIsProcessing(true);
      setRenderError(null);

      try {
        // Simulate content processing time for debugging
        setTimeout(() => {
          setIsProcessing(false);
        }, 0);
      } catch (error) {
        console.error('❌ [Blog Debug] SafeContentRenderer: Processing error:', error);
        setRenderError(error);
        setIsProcessing(false);
      }
    }
  }, [content]);

  if (!content) {
    if (IS_DEVELOPMENT) {
      console.warn('⚠️  [Blog Debug] SafeContentRenderer: No content provided');
    }
    return fallback || <p className="text-gray-500">Conteúdo não disponível.</p>;
  }

  // Validate content
  const contentIssues = BlogContentProcessor.validateContentHTML(content);
  if (contentIssues.length > 0) {
    if (IS_DEVELOPMENT) {
      console.warn('⚠️  [Blog Debug] SafeContentRenderer: Content issues detected:', contentIssues);
    }
  }

  if (renderError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold mb-2">Erro ao processar conteúdo</h3>
        <p className="text-red-600 text-sm">
          O conteúdo não pôde ser renderizado devido a um erro de formatação.
        </p>
        {IS_DEVELOPMENT && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-red-700">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">
              {renderError.message}
            </pre>
          </details>
        )}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: content
      }}
      onError={(e) => {
        console.error('❌ [Blog Debug] SafeContentRenderer: Render error:', e);
        setRenderError(new Error('Content rendering failed'));
      }}
    />
  );
};

export default SafeContentRenderer;