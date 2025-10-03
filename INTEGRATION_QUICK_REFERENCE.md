# Component Integration Quick Reference

## 📍 Where Components Were Added

### ContactForm
**Location:** `/app/contato/page.tsx` (NEW PAGE)
**Route:** `https://saraivavision.com.br/contato`
**Purpose:** Full contact page with form and clinic information

### GoogleReviewsWidget  
**Added to 3 pages:**

1. `/app/familiar/page.tsx` - Line ~125 (after Trust Section)
2. `/app/jovem/page.tsx` - Line ~133 (after Tech Section)  
3. `/app/senior/page.tsx` - Line ~155 (after Trust Section)

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev
# Visit: http://localhost:3000/contato
# Visit: http://localhost:3000/familiar
# Visit: http://localhost:3000/jovem
# Visit: http://localhost:3000/senior

# Build (production)
npm run build

# Lint
npm run lint

# Tests
npm run test:run
```

---

## 🔧 Component Usage

### ContactForm (Server Component Page)
```tsx
import ContactForm from '@/components/forms/ContactForm';

<ContactForm />
```

### GoogleReviewsWidget (Client Component)
```tsx
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget';

<GoogleReviewsWidget 
  maxReviews={3} 
  showStats={true} 
/>
```

---

## 📊 Environment Variables Needed

```env
# Google Reviews
VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE

# Contact Form
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=contato@saraivavision.com.br
RESEND_TO_EMAIL=saraivavision@gmail.com
```

---

## ✅ Testing Checklist

### Contact Page (`/contato`)
- [ ] Form loads without errors
- [ ] All fields validate correctly
- [ ] Form submits successfully
- [ ] Success message displays
- [ ] Error handling works
- [ ] Phone auto-formats (33) 99999-9999
- [ ] LGPD consent checkbox required
- [ ] Google Maps embed loads
- [ ] All contact links work (phone, email, WhatsApp)
- [ ] Responsive on mobile/tablet/desktop

### Profile Pages with Reviews
- [ ] `/familiar` - Reviews widget displays
- [ ] `/jovem` - Reviews widget displays
- [ ] `/senior` - Reviews widget displays
- [ ] Reviews load from API (or fallback)
- [ ] Star ratings show correctly
- [ ] Stats display (avg rating, count)
- [ ] Carousel works on mobile
- [ ] Grid layout on desktop
- [ ] "View All Reviews" link works
- [ ] Responsive design works

---

## 🐛 Troubleshooting

### ContactForm not submitting
1. Check `RESEND_API_KEY` is set
2. Verify `/api/contact` route exists
3. Check browser console for errors
4. Verify `app/actions/contact.ts` exists

### GoogleReviewsWidget not loading
1. Check `VITE_GOOGLE_PLACE_ID` is set
2. Verify `/api/reviews` route works
3. Check fallback reviews display
4. Verify Google Places API quota

### Build errors
1. Run `npm run build` and check output
2. ESLint warnings in test files are OK
3. Fix TypeScript errors in `/components`

---

## 📁 Key Files Modified

```
app/
├── contato/
│   └── page.tsx                    ← NEW (Contact Page)
├── familiar/page.tsx                ← MODIFIED (+GoogleReviewsWidget)
├── jovem/page.tsx                   ← MODIFIED (+GoogleReviewsWidget)  
└── senior/page.tsx                  ← MODIFIED (+GoogleReviewsWidget)

components/
├── forms/
│   └── ContactForm.tsx              ← USED (fixed React import)
└── GoogleReviewsWidget.tsx          ← USED
```

---

## 🎨 Styling

### Contact Page
- **Primary Color:** Blue (#2563EB)
- **Layout:** 2-column grid (form + info)
- **Responsive:** Stacks on mobile (<768px)

### GoogleReviewsWidget  
- **Star Color:** Yellow (#FDE047)
- **Layout:** Carousel (mobile) / Grid (desktop)
- **Max Width:** 1280px (max-w-7xl)

---

## 📞 Support

For issues or questions:
- Check `AGENTS.md` for build commands
- Review `API_ROUTES.md` for API docs
- See full details in `COMPONENT_INTEGRATION_SUMMARY.md`

---

**Last Updated:** 2025-10-03
**Status:** ✅ Integration Complete
