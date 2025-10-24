# Google Analytics/GTM Proxy - Compliance & Privacy Guide

## ⚠️ CRITICAL: Legal & Ethical Requirements

This document outlines the **mandatory compliance requirements** before enabling the GTM/Analytics proxy in production.

---

## 📋 Pre-Production Checklist

### 1. ✅ Consent Management System (REQUIRED)

**Status**: 🔴 NOT IMPLEMENTED - Must be completed before production

**Requirements**:
- [ ] Implement consent banner compliant with GDPR/LGPD
- [ ] Obtain **explicit user consent** before loading analytics
- [ ] Allow users to opt-out at any time
- [ ] Store consent choice in cookie: `analytics_consent=granted|denied`
- [ ] Implement Consent Mode v2 for Google Analytics

**Implementation**:
```javascript
// Example: Check consent before loading analytics
if (getCookie('analytics_consent') === 'granted') {
  loadGTM();
} else {
  showConsentBanner();
}
```

**Resources**:
- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

### 2. ✅ Privacy Policy Updates (REQUIRED)

**Status**: 🔴 NOT UPDATED - Must update before production

**Required Disclosures**:
- [ ] Use of Google Analytics and Tag Manager
- [ ] Data collection methods and purposes
- [ ] User rights (access, deletion, portability)
- [ ] Data retention periods
- [ ] International data transfers (Google servers in US)
- [ ] Contact information for Data Protection Officer

**Location**: https://saraivavision.com.br/privacidade

**Template Sections to Add**:
```markdown
## Uso de Cookies e Analytics

Este site utiliza Google Analytics e Google Tag Manager para coletar
dados anônimos sobre uso e desempenho. Estes serviços coletam:
- Páginas visitadas
- Tempo de permanência
- Localização geográfica aproximada
- Tipo de dispositivo e navegador

Você pode optar por não participar desta coleta através do banner de
consentimento ou nas configurações de privacidade.

### Transferência Internacional de Dados

Os dados coletados pelo Google Analytics são processados nos Estados
Unidos. Esta transferência é realizada sob cláusulas contratuais padrão
aprovadas pela União Europeia.
```

---

### 3. ✅ Server-Side Consent Validation (REQUIRED)

**Status**: 🟡 CONFIGURED BUT DISABLED - Uncomment in production

**Current State**:
- Consent checks are **commented out** in `nginx-gtm-proxy.conf`
- Must be enabled before production use

**Activation**:
```nginx
# In /etc/nginx/sites-enabled/saraivavision
# Uncomment these lines in ALL analytics locations:

location = /t/gtm.js {
    if ($cookie_analytics_consent != "granted") {
        return 403;
    }
    # ... rest of config
}
```

**Files to Update**:
- `/etc/nginx/sites-enabled/saraivavision`
- Locations: `/t/gtm.js`, `/t/gtag.js`, `/t/collect`, `/t/analytics.js`

---

### 4. ✅ Legal Review (REQUIRED)

**Status**: 🔴 NOT COMPLETED - Consult legal counsel

**Required Actions**:
- [ ] Review with privacy counsel specializing in LGPD/GDPR
- [ ] Assess risk of ad blocker bypass
- [ ] Document consent flow and data processing
- [ ] Sign Data Processing Agreement with Google
- [ ] Update Terms of Service if needed

**Contacts**:
- LGPD Attorney: [TO BE ADDED]
- Data Protection Officer: [TO BE ADDED]

---

## 🛡️ Ethical Considerations

### Why Ad Blocker Bypass May Be Problematic

1. **User Intent**: Ad blockers represent explicit user choice
2. **Trust**: Bypassing blockers may damage user trust
3. **Regulations**: May violate ePrivacy Directive in EU
4. **Ethics**: Questions about respecting user autonomy

### Alternative Approaches

**Recommended**: Respect user choice
```javascript
// Check if analytics is blocked
if (isAnalyticsBlocked()) {
  // Use privacy-friendly, server-side analytics
  // Example: Plausible, Matomo (self-hosted), PostHog
}
```

**If Using Proxy**:
- Only after explicit consent
- Clear disclosure in privacy policy
- Easy opt-out mechanism
- Regular privacy impact assessments

---

## 🔧 Technical Implementation

### Cache Configuration

**Directories Created**:
```bash
/var/cache/nginx/proxy      # Main proxy cache (10MB)
/var/cache/nginx/gtm_cache  # GTM-specific cache (50MB)
```

**Ownership**: `www-data:www-data` (Nginx user)

### Nginx Configuration Files

1. **Main Config**: `/etc/nginx/sites-enabled/saraivavision`
   - Contains `proxy_cache_path` directive
   - Defines cache zones

2. **GTM Proxy**: Included via `nginx-gtm-proxy.conf`
   - Location blocks for GTM/GA endpoints
   - Consent checks (currently disabled)
   - CORS headers

### Configuration Validation

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx (if valid)
sudo systemctl reload nginx

# Check cache directories
ls -la /var/cache/nginx/

# Monitor cache usage
du -sh /var/cache/nginx/*
```

---

## 📊 Monitoring & Compliance

### Ongoing Requirements

1. **Monthly Reviews**:
   - Review consent rates
   - Check for privacy policy updates
   - Monitor data processing activities

2. **Annual Audits**:
   - Privacy impact assessment
   - Legal compliance review
   - Security audit

3. **User Rights**:
   - Process data deletion requests within 30 days
   - Provide data export functionality
   - Maintain records of consent

### Logs to Monitor

```bash
# Analytics proxy requests
sudo tail -f /var/log/nginx/access.log | grep "/t/"

# Consent denials (403 responses)
sudo tail -f /var/log/nginx/access.log | grep "403"

# Cache statistics
sudo grep "X-Cache-Status" /var/log/nginx/access.log | sort | uniq -c
```

---

## 🚨 Incident Response

### If Privacy Breach Detected

1. **Immediate**:
   - Disable analytics proxy: `sudo rm /etc/nginx/conf.d/gtm-proxy.conf`
   - Reload Nginx: `sudo systemctl reload nginx`
   - Document incident details

2. **Within 24 Hours**:
   - Notify Data Protection Officer
   - Assess scope and impact
   - Notify affected users if required

3. **Within 72 Hours**:
   - Report to ANPD (Brazilian authority) if severe
   - Implement corrective measures
   - Update privacy policy

---

## 📚 Reference Documentation

### Legal Frameworks

- **LGPD** (Brazil): [Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **GDPR** (EU): [General Data Protection Regulation](https://gdpr-info.eu/)
- **ePrivacy**: [Directive 2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32002L0058)

### Google Documentation

- [Google Analytics Data Privacy](https://support.google.com/analytics/answer/6004245)
- [Google Tag Manager Privacy](https://marketingplatform.google.com/about/analytics/tag-manager/use-policy/)
- [Data Processing Terms](https://privacy.google.com/businesses/processorterms/)

### Best Practices

- [IAB Europe Transparency Framework](https://iabeurope.eu/transparency-consent-framework/)
- [Cookie Compliance Guide](https://www.cookielaw.org/the-cookie-law/)
- [OWASP Privacy Risks](https://owasp.org/www-community/vulnerabilities/Privacy_Violation)

---

## ✅ Production Activation Checklist

**Before enabling in production, ALL items must be checked**:

- [ ] Consent management system implemented and tested
- [ ] Privacy policy updated with analytics disclosure
- [ ] Server-side consent validation enabled in Nginx
- [ ] Legal counsel reviewed and approved implementation
- [ ] Data Processing Agreement signed with Google
- [ ] DPO designated and contact info published
- [ ] User rights request process documented
- [ ] Incident response plan created
- [ ] Team trained on privacy requirements
- [ ] Monitoring and logging configured

**Activation Date**: ________________
**Approved By**: ________________
**Legal Sign-Off**: ________________

---

## 📞 Support & Questions

**Technical Issues**:
- File: `nginx-gtm-proxy.conf`
- Location: `/etc/nginx/sites-enabled/saraivavision`

**Privacy Questions**:
- Email: [DPO_EMAIL]
- Phone: [DPO_PHONE]

**Emergency Contact**:
- Dr. Philipe Saraiva Cruz
- Email: philipe_cruz@outlook.com

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Next Review**: 2026-01-24
**Status**: 🔴 NOT PRODUCTION READY - Requires compliance implementation
