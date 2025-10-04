/**
 * Healthcare Compliance Validator for Saraiva Vision Platform
 * Features: CFM compliance validation, LGPD compliance, medical content validation, performance monitoring
 */

/**
 * Brazilian Medical Compliance Standards
 */
const CFM_COMPLIANCE_STANDARDS = {
  // Required medical information
  requiredMedicalInfo: [
    'crm_number',
    'medical_specialty',
    'clinic_name',
    'contact_info'
  ],

  // Content validation requirements
  medicalContentRequirements: [
    'disclaimer_presence',
    'professional_credentials',
    'emergency_contacts',
    'privacy_policy'
  ],

  // Performance requirements for medical platforms
  performanceThresholds: {
    contentLoadTime: 3000,  // Medical content must load within 3 seconds
    interactivityTime: 2000, // Interface must be interactive within 2 seconds
    errorRate: 0.01         // Error rate must be below 1%
  }
};

/**
 * LGPD Compliance Requirements
 */
const LGPD_REQUIREMENTS = {
  // Required consent mechanisms
  consentRequirements: [
    'data_processing_consent',
    'analytics_consent',
    'marketing_consent'
  ],

  // Data protection measures
  protectionMeasures: [
    'data_encryption',
    'access_control',
    'audit_logging',
    'data_retention_policy'
  ]
};

/**
 * Healthcare Compliance Validator
 */
class HealthcareComplianceValidator {
  constructor() {
    this.validationResults = new Map();
    this.lastValidationTime = null;
    this.validationInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Initialize healthcare compliance monitoring
   */
  initialize() {
    if (this.isMonitoring) return;

    console.info('[Healthcare Compliance] Initializing compliance validation...');

    // Run initial validation
    this.validateAllCompliance();

    // Setup continuous monitoring
    this.setupContinuousMonitoring();

    this.isMonitoring = true;
    console.info('[Healthcare Compliance] Compliance monitoring initialized');
  }

  /**
   * Validate all compliance requirements
   */
  async validateAllCompliance() {
    const startTime = performance.now();
    const results = {
      cfm: await this.validateCFMCompliance(),
      lgpd: await this.validateLGPDCompliance(),
      performance: await this.validatePerformanceCompliance(),
      security: await this.validateSecurityCompliance(),
      content: await this.validateContentCompliance()
    };

    const validationTime = performance.now() - startTime;

    // Store results
    this.validationResults.set('comprehensive', {
      ...results,
      validationTime,
      timestamp: Date.now(),
      overallCompliant: Object.values(results).every(r => r.compliant)
    });

    this.lastValidationTime = Date.now();

    // Log results
    this.logValidationResults(results);

    return results;
  }

  /**
   * Validate CFM (Conselho Federal de Medicina) compliance
   */
  async validateCFMCompliance() {
    const issues = [];
    const checks = [];

    // Check for CRM number
    const crmElements = document.querySelectorAll('[data-crm], .crm-number, .medical-credentials');
    if (crmElements.length === 0) {
      issues.push({
        type: 'critical',
        requirement: 'CRM Number',
        message: 'CRM number not found on page',
        element: 'medical-credentials'
      });
    } else {
      checks.push({
        requirement: 'CRM Number',
        status: 'pass',
        elements: crmElements.length
      });
    }

    // Check for medical disclaimers
    const disclaimers = document.querySelectorAll('[data-medical-disclaimer], .medical-disclaimer, .disclaimer');
    if (disclaimers.length === 0) {
      issues.push({
        type: 'warning',
        requirement: 'Medical Disclaimer',
        message: 'Medical disclaimer not found',
        element: 'medical-disclaimer'
      });
    } else {
      checks.push({
        requirement: 'Medical Disclaimer',
        status: 'pass',
        elements: disclaimers.length
      });
    }

    // Check for emergency contact information
    const emergencyContacts = document.querySelectorAll('[data-emergency], .emergency-contact, .whatsapp-urgent');
    if (emergencyContacts.length === 0) {
      issues.push({
        type: 'critical',
        requirement: 'Emergency Contacts',
        message: 'Emergency contact information not found',
        element: 'emergency-contact'
      });
    } else {
      checks.push({
        requirement: 'Emergency Contacts',
        status: 'pass',
        elements: emergencyContacts.length
      });
    }

    // Check for professional credentials
    const credentials = document.querySelectorAll('[data-credentials], .professional-credentials, .doctor-info');
    if (credentials.length === 0) {
      issues.push({
        type: 'critical',
        requirement: 'Professional Credentials',
        message: 'Professional credentials not found',
        element: 'professional-credentials'
      });
    } else {
      checks.push({
        requirement: 'Professional Credentials',
        status: 'pass',
        elements: credentials.length
      });
    }

    const result = {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      checks,
      standard: 'CFM Brazil',
      timestamp: Date.now()
    };

    this.validationResults.set('cfm', result);
    return result;
  }

  /**
   * Validate LGPD (Lei Geral de Proteção de Dados) compliance
   */
  async validateLGPDCompliance() {
    const issues = [];
    const checks = [];

    // Check for privacy policy
    const privacyLinks = document.querySelectorAll('a[href*="privacy"], a[href*="privacidade"], .privacy-policy');
    if (privacyLinks.length === 0) {
      issues.push({
        type: 'critical',
        requirement: 'Privacy Policy',
        message: 'Privacy policy link not found',
        element: 'privacy-policy'
      });
    } else {
      checks.push({
        requirement: 'Privacy Policy',
        status: 'pass',
        elements: privacyLinks.length
      });
    }

    // Check for consent management
    const consentElements = document.querySelectorAll('[data-consent], .consent-banner, .cookie-consent');
    if (consentElements.length === 0) {
      issues.push({
        type: 'critical',
        requirement: 'Consent Management',
        message: 'Consent management system not found',
        element: 'consent-banner'
      });
    } else {
      checks.push({
        requirement: 'Consent Management',
        status: 'pass',
        elements: consentElements.length
      });
    }

    // Check for data processing information
    const dataProcessingInfo = document.querySelectorAll('[data-processing], .data-processing-info');
    if (dataProcessingInfo.length === 0) {
      issues.push({
        type: 'warning',
        requirement: 'Data Processing Information',
        message: 'Data processing information not clearly displayed',
        element: 'data-processing'
      });
    } else {
      checks.push({
        requirement: 'Data Processing Information',
        status: 'pass',
        elements: dataProcessingInfo.length
      });
    }

    // Validate consent state
    const consentState = this.getConsentState();
    if (!consentState.hasDataProcessingConsent) {
      issues.push({
        type: 'warning',
        requirement: 'Data Processing Consent',
        message: 'Data processing consent not recorded',
        element: 'consent-state'
      });
    } else {
      checks.push({
        requirement: 'Data Processing Consent',
        status: 'pass',
        consentState
      });
    }

    const result = {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      checks,
      standard: 'LGPD Brazil',
      timestamp: Date.now(),
      consentState
    };

    this.validationResults.set('lgpd', result);
    return result;
  }

  /**
   * Validate performance compliance for medical platform
   */
  async validatePerformanceCompliance() {
    const issues = [];
    const checks = [];

    // Get performance metrics
    const performanceMetrics = this.getPerformanceMetrics();

    // Check content load time
    if (performanceMetrics.contentLoadTime > CFM_COMPLIANCE_STANDARDS.performanceThresholds.contentLoadTime) {
      issues.push({
        type: 'critical',
        requirement: 'Content Load Time',
        message: `Medical content loading too slow: ${performanceMetrics.contentLoadTime}ms`,
        value: performanceMetrics.contentLoadTime,
        threshold: CFM_COMPLIANCE_STANDARDS.performanceThresholds.contentLoadTime
      });
    } else {
      checks.push({
        requirement: 'Content Load Time',
        status: 'pass',
        value: performanceMetrics.contentLoadTime
      });
    }

    // Check interactivity time
    if (performanceMetrics.interactivityTime > CFM_COMPLIANCE_STANDARDS.performanceThresholds.interactivityTime) {
      issues.push({
        type: 'critical',
        requirement: 'Interactivity Time',
        message: `Interface response too slow: ${performanceMetrics.interactivityTime}ms`,
        value: performanceMetrics.interactivityTime,
        threshold: CFM_COMPLIANCE_STANDARDS.performanceThresholds.interactivityTime
      });
    } else {
      checks.push({
        requirement: 'Interactivity Time',
        status: 'pass',
        value: performanceMetrics.interactivityTime
      });
    }

    // Check error rate
    if (performanceMetrics.errorRate > CFM_COMPLIANCE_STANDARDS.performanceThresholds.errorRate) {
      issues.push({
        type: 'critical',
        requirement: 'Error Rate',
        message: `Error rate too high: ${(performanceMetrics.errorRate * 100).toFixed(2)}%`,
        value: performanceMetrics.errorRate,
        threshold: CFM_COMPLIANCE_STANDARDS.performanceThresholds.errorRate
      });
    } else {
      checks.push({
        requirement: 'Error Rate',
        status: 'pass',
        value: performanceMetrics.errorRate
      });
    }

    const result = {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      checks,
      metrics: performanceMetrics,
      standard: 'Healthcare Performance',
      timestamp: Date.now()
    };

    this.validationResults.set('performance', result);
    return result;
  }

  /**
   * Validate security compliance
   */
  async validateSecurityCompliance() {
    const issues = [];
    const checks = [];

    // Check HTTPS
    if (!window.location.protocol.includes('https')) {
      issues.push({
        type: 'critical',
        requirement: 'HTTPS Connection',
        message: 'Site not serving over HTTPS',
        element: 'protocol'
      });
    } else {
      checks.push({
        requirement: 'HTTPS Connection',
        status: 'pass'
      });
    }

    // Check for security headers (simulated)
    const hasSecurityHeaders = document.querySelector('meta[http-equiv="Content-Security-Policy"]') ||
                             document.querySelector('meta[http-equiv="X-Frame-Options"]');

    if (!hasSecurityHeaders) {
      issues.push({
        type: 'warning',
        requirement: 'Security Headers',
        message: 'Security headers may not be properly configured',
        element: 'security-headers'
      });
    } else {
      checks.push({
        requirement: 'Security Headers',
        status: 'pass'
      });
    }

    // Check for input sanitization indicators
    const sanitizedInputs = document.querySelectorAll('[data-sanitized], .sanitized-input');
    if (sanitizedInputs.length === 0) {
      issues.push({
        type: 'warning',
        requirement: 'Input Sanitization',
        message: 'Input sanitization indicators not found',
        element: 'input-sanitization'
      });
    } else {
      checks.push({
        requirement: 'Input Sanitization',
        status: 'pass',
        elements: sanitizedInputs.length
      });
    }

    const result = {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      checks,
      standard: 'Security Compliance',
      timestamp: Date.now()
    };

    this.validationResults.set('security', result);
    return result;
  }

  /**
   * Validate medical content compliance
   */
  async validateContentCompliance() {
    const issues = [];
    const checks = [];

    // Check for medical content structure
    const medicalSections = document.querySelectorAll('[data-medical-section], .medical-content, section');
    if (medicalSections.length === 0) {
      issues.push({
        type: 'warning',
        requirement: 'Medical Content Structure',
        message: 'Medical content sections not properly structured',
        element: 'medical-content'
      });
    } else {
      checks.push({
        requirement: 'Medical Content Structure',
        status: 'pass',
        elements: medicalSections.length
      });
    }

    // Check for accessibility
    const hasAltText = document.querySelectorAll('img:not([alt])').length === 0;
    if (!hasAltText) {
      issues.push({
        type: 'warning',
        requirement: 'Image Alt Text',
        message: 'Some medical images missing alt text',
        element: 'image-alt-text'
      });
    } else {
      checks.push({
        requirement: 'Image Alt Text',
        status: 'pass'
      });
    }

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasH1 = document.querySelector('h1');
    if (!hasH1) {
      issues.push({
        type: 'warning',
        requirement: 'Heading Structure',
        message: 'Missing H1 heading for medical content',
        element: 'heading-structure'
      });
    } else {
      checks.push({
        requirement: 'Heading Structure',
        status: 'pass',
        headings: headings.length
      });
    }

    const result = {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      checks,
      standard: 'Medical Content',
      timestamp: Date.now()
    };

    this.validationResults.set('content', result);
    return result;
  }

  /**
   * Get current consent state
   */
  getConsentState() {
    return {
      hasDataProcessingConsent: localStorage.getItem('lgpd-consent-analytics') === 'true',
      hasMarketingConsent: localStorage.getItem('lgpd-consent-marketing') === 'true',
      consentTimestamp: localStorage.getItem('lgpd-consent-timestamp'),
      consentVersion: localStorage.getItem('lgpd-consent-version')
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const scriptMonitor = window.scriptLoadingTracker;

    return {
      contentLoadTime: navigation?.domContentLoadedEventEnd || 0,
      interactivityTime: navigation?.loadEventEnd || 0,
      errorRate: this.calculateErrorRate(),
      scriptsLoaded: scriptMonitor ? Object.keys(scriptMonitor.getMetrics()).length : 0
    };
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate() {
    const scriptMonitor = window.scriptLoadingTracker;
    if (!scriptMonitor) return 0;

    const metrics = scriptMonitor.getMetrics();
    const scriptCount = Object.keys(metrics).length;
    const errorCount = Object.values(metrics).filter(m => m.status === 'error').length;

    return scriptCount > 0 ? errorCount / scriptCount : 0;
  }

  /**
   * Setup continuous monitoring
   */
  setupContinuousMonitoring() {
    // Validate compliance every 5 minutes
    this.validationInterval = setInterval(() => {
      this.validateAllCompliance().catch(error => {
        console.error('[Healthcare Compliance] Validation error:', error);
      });
    }, 5 * 60 * 1000);

    // Listen for page changes
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => this.validateAllCompliance(), 2000);
      }
    });

    urlObserver.observe(document, { subtree: true, childList: true });
  }

  /**
   * Log validation results
   */
  logValidationResults(results) {
    const totalIssues = Object.values(results).reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = Object.values(results).reduce((sum, r) =>
      sum + r.issues.filter(i => i.type === 'critical').length, 0);

    if (criticalIssues > 0) {
      console.error(`[Healthcare Compliance] ${criticalIssues} critical issues found!`, results);
    } else if (totalIssues > 0) {
      console.warn(`[Healthcare Compliance] ${totalIssues} issues found`, results);
    } else {
      console.info('[Healthcare Compliance] All checks passed ✓');
    }
  }

  /**
   * Get compliance report
   */
  getComplianceReport() {
    const comprehensive = this.validationResults.get('comprehensive');

    if (!comprehensive) {
      return {
        status: 'not_validated',
        message: 'Compliance validation not yet performed',
        recommendations: ['Run compliance validation to get detailed report']
      };
    }

    const criticalIssues = Object.values(comprehensive)
      .filter(r => r && r.issues)
      .flatMap(r => r.issues.filter(i => i.type === 'critical'));

    const warnings = Object.values(comprehensive)
      .filter(r => r && r.issues)
      .flatMap(r => r.issues.filter(i => i.type === 'warning'));

    return {
      status: comprehensive.overallCompliant ? 'compliant' : 'non_compliant',
      lastValidation: comprehensive.timestamp,
      validationTime: comprehensive.validationTime,
      criticalIssues,
      warnings,
      recommendations: this.generateRecommendations(criticalIssues, warnings),
      details: {
        cfm: comprehensive.cfm,
        lgpd: comprehensive.lgpd,
        performance: comprehensive.performance,
        security: comprehensive.security,
        content: comprehensive.content
      }
    };
  }

  /**
   * Generate recommendations based on issues
   */
  generateRecommendations(criticalIssues, warnings) {
    const recommendations = [];

    // Critical issue recommendations
    if (criticalIssues.some(i => i.requirement === 'CRM Number')) {
      recommendations.push({
        priority: 'critical',
        action: 'Display CRM Number',
        description: 'Add visible CRM-MG 69.870 to all pages',
        implementation: 'Add to footer and contact sections'
      });
    }

    if (criticalIssues.some(i => i.requirement === 'Emergency Contacts')) {
      recommendations.push({
        priority: 'critical',
        action: 'Add Emergency Contacts',
        description: 'Provide emergency WhatsApp and phone contact',
        implementation: 'Add to header and footer'
      });
    }

    if (criticalIssues.some(i => i.requirement === 'Content Load Time')) {
      recommendations.push({
        priority: 'critical',
        action: 'Optimize Medical Content Loading',
        description: 'Reduce medical content load time under 3 seconds',
        implementation: 'Implement lazy loading and optimize images'
      });
    }

    // Warning recommendations
    if (warnings.some(i => i.requirement === 'Image Alt Text')) {
      recommendations.push({
        priority: 'medium',
        action: 'Add Alt Text to Medical Images',
        description: 'Improve accessibility for medical content',
        implementation: 'Add descriptive alt text to all images'
      });
    }

    return recommendations;
  }

  /**
   * Stop compliance monitoring
   */
  stop() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    this.isMonitoring = false;
    console.info('[Healthcare Compliance] Monitoring stopped');
  }
}

// Global compliance validator instance
window.healthcareComplianceValidator = new HealthcareComplianceValidator();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.healthcareComplianceValidator.initialize();
  });
} else {
  window.healthcareComplianceValidator.initialize();
}

export default HealthcareComplianceValidator;
export { CFM_COMPLIANCE_STANDARDS, LGPD_REQUIREMENTS };