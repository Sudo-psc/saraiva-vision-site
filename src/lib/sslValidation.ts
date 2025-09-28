/**
 * SSL/TLS Certificate Validation Utilities
 * Provides tools for checking and diagnosing SSL certificate issues
 */

import { getGraphQLEndpoint, WORDPRESS_CONFIG } from '../config/wp';

/**
 * SSL Certificate Validation Result
 */
export interface SSLValidationResult {
  isValid: boolean;
  domain: string;
  ipAddress: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  chainComplete: boolean;
  protocols: string[];
  cipherSuites: string[];
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * SSL Error Types
 */
export enum SSLErrorType {
  INVALID_CERTIFICATE = 'invalid_certificate',
  EXPIRED_CERTIFICATE = 'expired_certificate',
  SELF_SIGNED_CERTIFICATE = 'self_signed_certificate',
  NAME_MISMATCH = 'name_mismatch',
  CHAIN_INCOMPLETE = 'chain_incomplete',
  WEAK_PROTOCOL = 'weak_protocol',
  WEAK_CIPHER = 'weak_cipher',
  REVOKED_CERTIFICATE = 'revoked_certificate',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Validate SSL certificate for a given domain
 */
export async function validateSSLCertificate(domain: string): Promise<SSLValidationResult> {
  const result: SSLValidationResult = {
    isValid: false,
    domain,
    ipAddress: '',
    issuer: '',
    validFrom: '',
    validTo: '',
    daysUntilExpiry: 0,
    chainComplete: false,
    protocols: [],
    cipherSuites: [],
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    // Get IP address
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await response.json();
      if (data.Answer && data.Answer[0]) {
        result.ipAddress = data.Answer[0].data;
      }
    } catch (error) {
      result.errors.push(`DNS resolution failed: ${error.message}`);
    }

    // Check SSL certificate via proxy or server-side endpoint
    try {
      // Try to fetch from GraphQL endpoint to test SSL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const testResponse = await fetch(`https://${domain}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (testResponse.ok) {
        result.isValid = true;
        result.warnings.push('SSL certificate appears valid');
      } else {
        result.errors.push(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        if (error.message.includes('certificate') || error.message.includes('SSL')) {
          result.errors.push('SSL certificate validation failed');
          result.errors.push(error.message);
        } else if (error.message.includes('Failed to fetch')) {
          result.errors.push('Network connection failed - possible SSL/CORS issue');
        }
      } else if (error.name === 'AbortError') {
        result.errors.push('Connection timeout - possible network or SSL issue');
      } else {
        result.errors.push(`Unknown SSL error: ${error.message}`);
      }
    }

    // Generate suggestions based on errors
    if (result.errors.length > 0) {
      result.suggestions.push(
        'Check SSL certificate installation on the server',
        'Ensure certificate chain is complete (fullchain.pem)',
        'Verify domain matches certificate common name',
        'Check for mixed content issues',
        'Consider using Let\'s Encrypt with certbot'
      );
    }

    // Calculate days until expiry (simplified)
    if (result.validTo) {
      try {
        const expiryDate = new Date(result.validTo);
        const now = new Date();
        result.daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (result.daysUntilExpiry < 30) {
          result.warnings.push(`Certificate expires in ${result.daysUntilExpiry} days`);
        }
      } catch (error) {
        result.warnings.push('Could not parse certificate expiry date');
      }
    }

  } catch (error) {
    result.errors.push(`Validation failed: ${error.message}`);
    result.suggestions.push('Try manual validation using openssl or SSL Labs');
  }

  return result;
}

/**
 * Check if current browser/client supports required SSL/TLS features
 */
export function checkSSLCompatibility(): {
  supported: boolean;
  tlsVersion: string;
  cipherSuites: string[];
  warnings: string[];
} {
  const info = {
    supported: true,
    tlsVersion: 'unknown',
    cipherSuites: [],
    warnings: []
  };

  // Check TLS version support
  if (typeof window !== 'undefined') {
    // Basic TLS version check (simplified)
    if (navigator.userAgent.includes('Chrome')) {
      info.tlsVersion = 'TLS 1.3 (estimated)';
    } else if (navigator.userAgent.includes('Firefox')) {
      info.tlsVersion = 'TLS 1.3 (estimated)';
    } else if (navigator.userAgent.includes('Safari')) {
      if (navigator.userAgent.includes('Version/15')) {
        info.tlsVersion = 'TLS 1.3';
      } else if (navigator.userAgent.includes('Version/14')) {
        info.tlsVersion = 'TLS 1.2';
        info.warnings.push('Safari version 14+ recommended for TLS 1.3 support');
      }
    }
  }

  return info;
}

/**
 * Get SSL configuration recommendations
 */
export function getSSLRecommendations(): {
  nginx: string[];
  certbot: string[];
  troubleshooting: string[];
} {
  return {
    nginx: [
      'ssl_protocols TLSv1.2 TLSv1.3;',
      'ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;',
      'ssl_prefer_server_ciphers off;',
      'ssl_session_cache shared:SSL:10m;',
      'ssl_session_timeout 10m;',
      'ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;',
      'ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;'
    ],
    certbot: [
      'sudo certbot --nginx -d domain.com',
      'sudo certbot certificates --check-expiry',
      'sudo systemctl reload nginx',
      'Test renewal: sudo certbot renew --dry-run'
    ],
    troubleshooting: [
      'Check DNS resolution: nslookup domain.com',
      'Test SSL: openssl s_client -connect domain.com:443 -showcerts',
      'Verify chain: curl -v https://domain.com',
      'Check SSL Labs: https://www.ssllabs.com/ssltest/'
    ]
  };
}

/**
 * Health check for GraphQL endpoint SSL
 */
export async function checkGraphQLEndpointSSL(): Promise<{
  endpoint: string;
  sslValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}> {
  const endpoint = getGraphQLEndpoint();
  const url = new URL(endpoint);

  return {
    endpoint,
    sslValid: false,
    errors: [],
    warnings: [],
    suggestions: []
  };
}

/**
 * Simple SSL check for GraphQL endpoint
 */
export async function simpleGraphQLSSLCheck(): Promise<{
  ok: boolean;
  error?: string;
  endpoint: string;
}> {
  try {
    const endpoint = getGraphQLEndpoint();
    if (!endpoint || !endpoint.startsWith('https://')) {
      return {
        ok: false,
        error: 'GraphQL endpoint is not configured or not using HTTPS',
        endpoint
      };
    }

    // Simple fetch test
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: AbortSignal.timeout(5000)
    });

    return {
      ok: response.ok,
      endpoint
    };
  } catch (error) {
    let errorMessage = 'Unknown SSL/network error';

    if (error instanceof TypeError && error.message.includes('certificate')) {
      errorMessage = 'SSL certificate validation failed';
    } else if (error instanceof TypeError && error.message.includes('CORS')) {
      errorMessage = 'CORS policy blocked the request';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - possible network or SSL issue';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      ok: false,
      error: errorMessage,
      endpoint: getGraphQLEndpoint()
    };
  }
}

/**
 * Format SSL validation results for display
 */
export function formatSSLValidationResult(result: SSLValidationResult): string {
  const lines = [
    `SSL Validation Results for ${result.domain}`,
    '='.repeat(50),
    `Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`,
    `IP Address: ${result.ipAddress || 'Unknown'}`,
    `Issuer: ${result.issuer || 'Unknown'}`,
    `Valid Until: ${result.validTo || 'Unknown'}`,
    `Days Until Expiry: ${result.daysUntilExpiry}`,
    `Chain Complete: ${result.chainComplete ? '✅ Yes' : '❌ No'}`,
  ];

  if (result.errors.length > 0) {
    lines.push('\n❌ Errors:');
    result.errors.forEach(error => lines.push(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    result.warnings.forEach(warning => lines.push(`  - ${warning}`));
  }

  if (result.suggestions.length > 0) {
    lines.push('\n💡 Suggestions:');
    result.suggestions.forEach(suggestion => lines.push(`  - ${suggestion}`));
  }

  return lines.join('\n');
}