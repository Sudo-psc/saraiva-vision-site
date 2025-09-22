# Vercel Deployment Checklist

Use this checklist to ensure proper deployment of the Saraiva Vision website with Resend contact form integration.

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project linked to Vercel (`vercel link`)
- [ ] Resend account created and API key obtained
- [ ] Domain configured (if using custom domain)

### 2. Environment Variables Configuration
- [ ] Run environment setup script (`npm run deploy:setup`)
- [ ] Set sensitive environment variables:
  - [ ] `RESEND_API_KEY` (production, preview, development)
  - [ ] `DOCTOR_EMAIL` (production, preview, development)
  - [ ] `RECAPTCHA_SECRET_KEY` (if using reCAPTCHA)
- [ ] Verify environment variables (`vercel env ls`)

### 3. Code Quality Checks
- [ ] All tests passing (`npm run test:run`)
- [ ] Contact form tests passing (`npm run test:contact`)
- [ ] No TypeScript/ESLint errors
- [ ] Build succeeds locally (`npm run build`)

## Deployment Process

### 1. Preview Deployment
- [ ] Deploy to preview (`vercel`)
- [ ] Test preview deployment (`npm run deploy:test:preview`)
- [ ] Verify contact form functionality
- [ ] Check performance metrics
- [ ] Review deployment logs

### 2. Production Deployment
- [ ] Deploy to production (`vercel --prod`)
- [ ] Test production deployment (`npm run deploy:test`)
- [ ] Verify all functionality works
- [ ] Monitor for errors in first 24 hours

## Post-Deployment Verification

### 1. Functional Testing
- [ ] Health endpoint responds (`/api/health`)
- [ ] Contact form accepts valid submissions
- [ ] Contact form rejects invalid submissions
- [ ] Rate limiting works properly
- [ ] Email delivery confirmed (check Dr. Philipe's inbox)
- [ ] CORS headers configured correctly

### 2. Performance Testing
- [ ] Response times under 3 seconds
- [ ] Cold start performance acceptable
- [ ] Memory usage within limits
- [ ] No timeout errors

### 3. Security Testing
- [ ] Input validation working
- [ ] XSS prevention active
- [ ] Rate limiting prevents abuse
- [ ] No sensitive data in logs
- [ ] HTTPS enforced

### 4. Monitoring Setup
- [ ] Vercel Analytics configured
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] Log aggregation working

## Environment-Specific Checks

### Production Environment
- [ ] Custom domain configured and SSL active
- [ ] Production API keys in use
- [ ] Production email addresses configured
- [ ] Strict rate limiting active (5 requests/15 minutes)
- [ ] Error reporting configured
- [ ] Backup monitoring in place

### Preview Environment
- [ ] Preview URL accessible
- [ ] Test email addresses configured
- [ ] Moderate rate limiting (10 requests/10 minutes)
- [ ] Safe for testing without affecting production

### Development Environment
- [ ] Local development server works (`vercel dev`)
- [ ] Development API keys configured
- [ ] Lenient rate limiting (20 requests/5 minutes)
- [ ] Debug logging enabled

## Rollback Plan

### If Deployment Fails
1. [ ] Check deployment logs (`vercel logs`)
2. [ ] Verify environment variables
3. [ ] Test locally with production config
4. [ ] Rollback to previous deployment if needed
5. [ ] Fix issues and redeploy

### Emergency Rollback
```bash
# Get list of deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url] --scope [team]
```

## Maintenance Tasks

### Regular Checks (Weekly)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review security logs
- [ ] Update dependencies if needed

### Monthly Tasks
- [ ] Rotate API keys
- [ ] Review and update rate limits
- [ ] Performance optimization review
- [ ] Security audit

## Contact Information

### Support Contacts
- **Development Team**: [Your team contact]
- **Vercel Support**: [Vercel support if needed]
- **Resend Support**: [Resend support if needed]

### Emergency Contacts
- **Dr. Philipe**: philipe_cruz@outlook.com
- **System Administrator**: [Admin contact]

## Documentation Links

- [Vercel Deployment Setup Guide](./VERCEL_DEPLOYMENT_SETUP.md)
- [Contact Form API Documentation](../api/contact/README.md)
- [Environment Variables Reference](./.env.example)
- [Testing Documentation](../api/contact/__tests__/README.md)

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: ___________  
**Environment**: ___________

### Sign-off
- [ ] Technical Lead: ___________
- [ ] QA Lead: ___________
- [ ] Product Owner: ___________

---

**Last Updated**: December 2024  
**Checklist Version**: 1.0.0