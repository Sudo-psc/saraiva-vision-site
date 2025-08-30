// Script de monitoramento CSP para adicionar no site (opcional)
// Adicione este código ao seu arquivo HTML principal para monitorar violações

(function() {
  // Listener para violações CSP
  document.addEventListener('securitypolicyviolation', function(e) {
    const violation = {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      documentURI: e.documentURI,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber
    };

    // Log no console para desenvolvimento
    console.group('🚨 CSP Violation Detected');
    console.error('Blocked URI:', violation.blockedURI);
    console.error('Violated Directive:', violation.violatedDirective);
    console.error('Source:', violation.sourceFile + ':' + violation.lineNumber);
    console.groupEnd();

    // Opcional: Enviar para servidor de logging
    // fetch('/api/csp-report', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(violation)
    // }).catch(err => console.error('Failed to report CSP violation:', err));

    // Alertas específicos para Google Services
    if (violation.blockedURI.includes('google.com') || 
        violation.blockedURI.includes('gstatic.com') ||
        violation.blockedURI.includes('googleapis.com')) {
      console.warn('🔍 Google Service blocked by CSP - check if all domains are whitelisted');
    }

    if (violation.violatedDirective === 'script-src' && 
        (violation.blockedURI.includes('recaptcha') || violation.blockedURI.includes('google.com'))) {
      console.error('❌ reCAPTCHA script blocked! Check script-src directive.');
    }

    if (violation.violatedDirective === 'connect-src' && 
        violation.blockedURI.includes('places.googleapis.com')) {
      console.error('❌ Google Places API blocked! Check connect-src directive.');
    }
  });

  // Log de inicialização
  console.log('🛡️ CSP Monitor initialized - Google reCAPTCHA and Places API protection active');
})();