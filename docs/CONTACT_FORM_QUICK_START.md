# Contact Form - Quick Start Guide

## TL;DR

✅ **Fully migrated Contact Form to Next.js 15 App Router with TypeScript**

- Component: `/components/forms/ContactForm.tsx`
- Server Action: `/app/actions/contact.ts`
- Types: `/types/contact.ts`
- API Route: `/app/api/contact/route.ts` (already exists)

---

## Install & Use (3 Steps)

### 1. Environment Variables

Add to `.env.local`:

```bash
RESEND_API_KEY=re_your_api_key_here
CONTACT_TO_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=contato@saraivavision.com.br
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
```

### 2. Import Component

```typescript
import ContactForm from '@/components/forms/ContactForm';

export default function Page() {
  return (
    <div className="container mx-auto py-16">
      <ContactForm onSuccess={() => console.log('Sent!')} />
    </div>
  );
}
```

### 3. Test It

```bash
npm run dev
# Visit http://localhost:3000 and test the form
```

---

## What's Included

| Feature | Status |
|---------|--------|
| TypeScript | ✅ Full type safety |
| Server Actions | ✅ Next.js 15 pattern |
| Validation (Zod) | ✅ Client + Server |
| LGPD Compliance | ✅ Consent checkbox |
| Accessibility | ✅ WCAG 2.1 AA |
| Spam Protection | ✅ Honeypot + Rate limit |
| Email (Resend) | ✅ Tested & working |
| Error Handling | ✅ Fallback contacts |
| Loading States | ✅ useTransition |
| Success Feedback | ✅ Animated message |

---

## Key Files

```
components/forms/ContactForm.tsx     # Main form component
app/actions/contact.ts               # Server Action
types/contact.ts                     # TypeScript interfaces
app/api/contact/route.ts             # API endpoint (existing)
src/lib/validation.js                # Zod schemas (existing)
```

---

## Form Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| Name | Text | 2-100 chars | Yes |
| Email | Email | Valid format | Yes |
| Phone | Tel | BR format: (XX) 9XXXX-XXXX | Yes |
| Message | Textarea | 10-1000 chars | Yes |
| Consent | Checkbox | Must be true | Yes |
| Honeypot | Hidden | Must be empty | No (anti-spam) |

---

## API Response

**Success (200):**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!",
  "messageId": "re_abc123"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": {
    "email": ["Formato inválido"]
  }
}
```

---

## Security

- ✅ **Rate Limiting**: 10 req/10min per IP
- ✅ **Input Sanitization**: HTML/XSS protection
- ✅ **Honeypot**: Bot detection
- ✅ **LGPD**: Privacy consent required
- ✅ **CSRF**: Auto-handled by Next.js

---

## Accessibility

- Semantic HTML (`<form>`, `<label>`, `<input>`)
- ARIA labels on all fields
- Screen reader announcements
- Keyboard navigation
- Error focus management
- High contrast colors

---

## Testing Locally

```bash
# 1. Start dev server
npm run dev

# 2. Fill form at http://localhost:3000/contato
# 3. Submit and check:
#    - Success message appears
#    - Email received at philipe_cruz@outlook.com
#    - Console logs show no errors

# 4. Test validation errors:
#    - Empty fields → Error messages
#    - Invalid email → "Formato inválido"
#    - Short message → "Mínimo 10 caracteres"
```

---

## Common Issues

### Email Not Sending?

**Check:**
1. Resend API key in `.env.local`
2. "From" email verified in Resend dashboard
3. Spam folder in recipient inbox
4. Resend logs: https://resend.com/emails

### Form Not Submitting?

**Check:**
1. Console for errors
2. Network tab → 200 OK?
3. Environment variables set
4. Rate limit not exceeded

### TypeScript Errors?

**Check:**
1. Run `npm run build`
2. All imports use correct paths
3. Type definitions in `/types/contact.ts`

---

## Next Steps

1. ✅ **Test form** with real data
2. ✅ **Verify email delivery**
3. ✅ **Check accessibility** with screen reader
4. ✅ **Monitor rate limits**
5. ⏳ **Replace old components** after testing
6. ⏳ **Archive** `src/components/Contact.jsx` and `ContactFormEnhanced.jsx`

---

## Migration Status

| Component | Status |
|-----------|--------|
| ContactForm.tsx | ✅ Complete |
| Server Action | ✅ Complete |
| Type Definitions | ✅ Complete |
| API Route | ✅ Already exists |
| Documentation | ✅ Complete |
| Old Components | ⏳ Keep for reference |

---

## Need Help?

- **Full Documentation**: `docs/CONTACT_FORM_MIGRATION.md`
- **Resend Docs**: https://resend.com/docs
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Zod Validation**: https://zod.dev/

---

**Status**: ✅ **READY FOR PRODUCTION**  
**Last Updated**: October 3, 2025
