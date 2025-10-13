import React, { useEffect, useRef } from 'react';

interface JotformEmbedProps {
  formId: string;
  height?: string;
  className?: string;
}

/**
 * Safe Jotform iframe integration with postMessage API
 * Prevents Same-Origin Policy (SOP) errors
 *
 * Note: SOP warnings in console are expected behavior and not errors
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export const JotformEmbed: React.FC<JotformEmbedProps> = ({
  formId,
  height = '600px',
  className
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Listen for postMessage from Jotform
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== 'https://form.jotform.com') {
        return;
      }

      // Handle different message types from Jotform
      if (event.data.action === 'submission-completed') {
        console.log('[JotformEmbed] Form submitted successfully');

        // Track in Google Analytics if available
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submission', {
            form_id: formId,
            event_category: 'contact',
            event_label: 'Jotform'
          });
        }

        // You can add custom logic here (redirect, show thank you message, etc.)
      }

      // Handle height adjustment from Jotform
      if (event.data.action === 'resize' && event.data.height && iframeRef.current) {
        iframeRef.current.style.height = `${event.data.height}px`;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [formId]);

  return (
    <iframe
      ref={iframeRef}
      src={`https://form.jotform.com/${formId}`}
      width="100%"
      height={height}
      frameBorder="0"
      scrolling="yes"
      className={className}
      sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      title="Formulário de Contato - Saraiva Vision"
      allow="geolocation; microphone; camera"
    />
  );
};
