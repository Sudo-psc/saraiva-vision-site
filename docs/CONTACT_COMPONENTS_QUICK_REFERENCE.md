# Contact Components Quick Reference

**Last Updated**: 2025-10-03

Quick reference guide for using the new contact form components in the Next.js migration.

## Components Overview

| Component | Location | Use Case |
|-----------|----------|----------|
| `EnhancedContactForm` | `components/forms/EnhancedContactForm.tsx` | Standalone contact form with all features |
| `ContactSection` | `components/ContactSection.tsx` | Full contact section with form + info cards |
| `ContactForm` | `components/forms/ContactForm.tsx` | Basic form (legacy compatibility) |

## Quick Start

### 1. Full Contact Section (Recommended)

```tsx
import ContactSection from '@/components/ContactSection';

export default function ContactPage() {
  return <ContactSection showMap={true} />;
}
```

### 2. Form Only

```tsx
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <EnhancedContactForm onSuccess={() => console.log('Success!')} />
    </div>
  );
}
```

### 3. Compact Form (Modal/Sidebar)

```tsx
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

<EnhancedContactForm
  compact={true}
  showFallbackContacts={false}
/>
```

## Props Reference

### EnhancedContactForm

```typescript
interface EnhancedContactFormProps {
  onSuccess?: () => void;           // Callback after successful submission
  compact?: boolean;                // Compact layout (default: false)
  showFallbackContacts?: boolean;   // Show fallback contacts on error (default: true)
}
```

### ContactSection

```typescript
interface ContactSectionProps {
  showMap?: boolean;        // Show Google Maps embed (default: false)
  compactForm?: boolean;    // Use compact form layout (default: false)
  className?: string;       // Additional CSS classes
}
```

## Validation Rules

| Field | Min | Max | Format | Required |
|-------|-----|-----|--------|----------|
| Name | 2 | 100 | Letters only | ✓ |
| Email | 1 | 255 | Valid email | ✓ |
| Phone | 10 | 11 | (XX) XXXXX-XXXX | ✓ |
| Message | 10 | 2000 | Text | ✓ |
| Consent | - | - | Checkbox | ✓ |

## Constants

```typescript
import { CONTACT, FORM, LGPD } from '@/lib/constants';

// Contact info
CONTACT.PHONE.NUMBER        // '5533998601427'
CONTACT.PHONE.DISPLAY       // '+55 (33) 99860-1427'
CONTACT.PHONE.WHATSAPP_URL  // 'https://wa.me/5533998601427'
CONTACT.EMAIL               // 'saraivavision@gmail.com'

// Form limits
FORM.VALIDATION.NAME_MIN    // 2
FORM.VALIDATION.NAME_MAX    // 100
FORM.VALIDATION.MESSAGE_MAX // 2000

// Rate limiting
FORM.RATE_LIMIT.MAX_ATTEMPTS // 3
FORM.RATE_LIMIT.WINDOW_MS    // 3600000 (1 hour)
```

## Validation Helpers

```typescript
import {
  contactFormSchema,
  validateContactField,
  formatPhoneForDisplay,
  checkRateLimit,
  recordSubmission,
} from '@/lib/validations/contact';

// Validate entire form
try {
  const validData = contactFormSchema.parse(formData);
} catch (error) {
  // Handle validation errors
}

// Validate single field
const result = validateContactField('email', 'test@example.com');
if (!result.success) {
  console.error(result.error);
}

// Format phone
const formatted = formatPhoneForDisplay('33999999999');
// Returns: '(33) 99999-9999'

// Check rate limit
const rateLimit = checkRateLimit();
if (!rateLimit.allowed) {
  console.log(`Try again at ${rateLimit.resetTime}`);
}

// Record submission
recordSubmission(); // Call after successful submit
```

## Type Imports

```typescript
import type {
  ContactFormData,
  ContactFormErrors,
  ContactFormState,
  RateLimitInfo,
} from '@/types/contact';

// Or from validation lib
import type {
  ContactFormData,
  ContactFormWithCaptcha,
} from '@/lib/validations/contact';
```

## Common Use Cases

### 1. Homepage Contact Section

```tsx
// app/page.tsx
import ContactSection from '@/components/ContactSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ContactSection showMap={true} />
    </>
  );
}
```

### 2. Dedicated Contact Page

```tsx
// app/contato/page.tsx
import { Metadata } from 'next';
import ContactSection from '@/components/ContactSection';

export const metadata: Metadata = {
  title: 'Contato | Saraiva Vision',
  description: 'Entre em contato com a Saraiva Vision',
};

export default function ContatoPage() {
  return (
    <main>
      <ContactSection showMap={true} compactForm={false} />
    </main>
  );
}
```

### 3. Modal/Dialog Form

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

export function ContactModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agende sua Consulta</DialogTitle>
        </DialogHeader>
        <EnhancedContactForm
          compact={true}
          showFallbackContacts={false}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Sidebar Form

```tsx
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

export function ContactSidebar() {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24">
        <h3 className="text-xl font-bold mb-4">Agende sua Consulta</h3>
        <EnhancedContactForm
          compact={true}
          showFallbackContacts={true}
        />
      </div>
    </aside>
  );
}
```

### 5. Custom Success Handler

```tsx
import { useRouter } from 'next/navigation';
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

export function CustomContactForm() {
  const router = useRouter();

  const handleSuccess = () => {
    // Custom analytics
    window.gtag?.('event', 'contact_form_submit', {
      event_category: 'engagement',
      event_label: 'Contact Form',
    });

    // Redirect to thank you page
    router.push('/obrigado');
  };

  return <EnhancedContactForm onSuccess={handleSuccess} />;
}
```

## Styling

### Tailwind Classes

The components use Tailwind CSS. Key classes:

```typescript
// Form inputs
'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'

// Error states
'border-red-400 focus:ring-red-300'

// Buttons
'w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'

// Cards
'bg-white rounded-xl p-5 shadow-md border border-slate-200'
```

### Custom Styling

Override with className prop:

```tsx
<ContactSection className="bg-gradient-to-br from-blue-50 to-purple-50" />
```

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate fields
- **Shift+Tab**: Navigate backward
- **Enter**: Submit form
- **Escape**: Dismiss errors

### Screen Reader Support

- All fields have proper labels
- Error messages announced
- Success/loading states announced
- Skip links for keyboard users

### ARIA Attributes

```html
<!-- All inputs have proper ARIA -->
<input
  aria-invalid={hasError}
  aria-describedby="field-error"
  aria-required="true"
/>

<!-- Live regions for announcements -->
<div aria-live="polite" role="status">
  {announceMessage}
</div>
```

## Security

### Spam Protection

1. **Honeypot**: Hidden field that bots fill
2. **Rate Limiting**: 3 submissions per hour (client-side)
3. **Sanitization**: XSS protection on all fields
4. **reCAPTCHA Ready**: Optional token support

### LGPD Compliance

- ✅ Explicit consent required
- ✅ Purpose clearly stated
- ✅ User rights displayed
- ✅ Data minimization
- ✅ Contact for data requests

## Troubleshooting

### Form Not Submitting

```typescript
// Check console for errors
// Ensure server action exists
import { submitContactAction } from '@/app/actions/contact';

// Check API endpoint responds
fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
```

### Validation Errors Not Showing

```typescript
// Ensure touched state is set
setTouched({ name: true, email: true, phone: true, message: true });

// Check error state
console.log(errors);
```

### Rate Limit Issues

```typescript
// Clear localStorage for testing
localStorage.removeItem('contact_form_submissions');

// Or check current submissions
const submissions = JSON.parse(
  localStorage.getItem('contact_form_submissions') || '[]'
);
console.log(submissions);
```

### TypeScript Errors

```typescript
// Ensure proper types imported
import type { ContactFormData } from '@/types/contact';

// Or from validation lib
import type { ContactFormData } from '@/lib/validations/contact';
```

## Testing

### Unit Tests

```typescript
// __tests__/components/EnhancedContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';

test('validates email field', async () => {
  render(<EnhancedContactForm />);

  const emailInput = screen.getByLabelText(/e-mail/i);
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.blur(emailInput);

  await waitFor(() => {
    expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// tests/e2e/contact.spec.ts
import { test, expect } from '@playwright/test';

test('submits contact form successfully', async ({ page }) => {
  await page.goto('/contato');

  await page.fill('#name', 'João da Silva');
  await page.fill('#email', 'joao@example.com');
  await page.fill('#phone', '(33) 99999-9999');
  await page.fill('#message', 'Test message here');
  await page.check('#consent');

  await page.click('button[type="submit"]');

  await expect(page.getByText(/mensagem enviada/i)).toBeVisible();
});
```

## Performance

### Bundle Size

- EnhancedContactForm: ~25KB (gzipped)
- ContactSection: ~35KB (gzipped)
- Validation lib: ~14KB (shared)

### Optimizations

- ✅ Debounced validation (500ms)
- ✅ useTransition for non-blocking submits
- ✅ Code splitting with Next.js
- ✅ Lazy-loaded animations

## Migration from Legacy

### Before (Legacy)

```jsx
// src/components/Contact.jsx
import Contact from '@/components/Contact';

<Contact />
```

### After (Next.js)

```tsx
// app/page.tsx
import ContactSection from '@/components/ContactSection';

<ContactSection showMap={true} />
```

## Resources

- **Full Documentation**: `docs/CONTACT_MIGRATION_REPORT.md`
- **Type Definitions**: `types/contact.ts`
- **Validation Library**: `lib/validations/contact.ts`
- **Constants**: `lib/constants.ts`

## Need Help?

- Check the full migration report: `docs/CONTACT_MIGRATION_REPORT.md`
- Review the source code: `components/forms/EnhancedContactForm.tsx`
- Test locally: `npm run dev` and navigate to `/contato`
