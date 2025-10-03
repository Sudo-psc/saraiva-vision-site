# Integration Architecture Diagram

## 🏗️ Application Structure After Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Saraiva Vision Platform                      │
│                    (Next.js 15 App Router)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────┐
         │          Root Layout                  │
         │      (app/layout.tsx)                 │
         │   - Navbar, Footer, Providers        │
         └──────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│  Profile Pages   │                    │   Contact Page   │
│                  │                    │                  │
│  /familiar       │◄──────────┐       │   /contato       │
│  /jovem          │           │       │                  │
│  /senior         │           │       │  ┌────────────┐  │
└──────────────────┘           │       │  │ContactForm │  │
        │                      │       │  └────────────┘  │
        │                      │       │  + Contact Info  │
        ▼                      │       │  + Google Maps   │
┌──────────────────┐           │       └──────────────────┘
│GoogleReviewsWidget│──────────┤                │
└──────────────────┘           │                │
        │                      │                │
        │                      │                │
        ▼                      │                ▼
┌──────────────────────────────┴────────────────────────────┐
│                     API Routes                             │
│                                                            │
│  /api/reviews          /api/contact          /api/...     │
│  (Google Places)       (Resend Email)                     │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────┐
         │        External Services              │
         │                                       │
         │  - Google Places API                  │
         │  - Resend Email API                   │
         │  - Supabase (future)                  │
         └──────────────────────────────────────┘
```

---

## 📄 Page Flow Diagram

### Contact Page Flow (`/contato`)

```
User visits /contato
        │
        ▼
┌────────────────────┐
│   Server renders   │
│   Contact Page     │
│   with metadata    │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│  ContactForm       │
│  (Client Comp)     │
│  hydrates          │
└────────────────────┘
        │
        ▼
┌────────────────────┐     YES    ┌──────────────────┐
│ User fills form    │──────────►│ Validation OK?   │
└────────────────────┘            └──────────────────┘
                                          │ NO
                                          ▼
                                   Show field errors
                                          │
                                          ▼ YES
                                  ┌──────────────────┐
                                  │ Submit to        │
                                  │ /api/contact     │
                                  └──────────────────┘
                                          │
                    ┌────────────────────┴────────────────────┐
                    │ SUCCESS                                 │ FAIL
                    ▼                                         ▼
            ┌──────────────────┐                    ┌──────────────────┐
            │ Show success     │                    │ Show error       │
            │ message          │                    │ + fallback CTAs  │
            │ Reset form       │                    └──────────────────┘
            └──────────────────┘
```

---

### Profile Pages Flow (with Reviews)

```
User visits /familiar, /jovem, or /senior
        │
        ▼
┌────────────────────┐
│   Server renders   │
│   Profile Page     │
│   + Hero/Services  │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│GoogleReviewsWidget │
│  (Client Comp)     │
│  hydrates          │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│  useEffect fires   │
│  Fetch reviews     │
│  from /api/reviews │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│  API call to       │
│  Google Places     │
│  (with 30min cache)│
└────────────────────┘
        │
        ▼
┌────────────────────┐     YES    ┌──────────────────┐
│ Reviews returned?  │──────────►│ Display reviews  │
└────────────────────┘            │ + stats          │
        │ NO                      └──────────────────┘
        ▼
┌────────────────────┐
│  Use fallback      │
│  reviews (3 static)│
└────────────────────┘
```

---

## 🔄 Data Flow

### ContactForm Submission

```
┌──────────┐      Form Data       ┌─────────────────┐
│  User    │────────────────────►│  ContactForm    │
│  Input   │                      │  Component      │
└──────────┘                      └─────────────────┘
                                          │
                                  Client validation
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │ Server Action   │
                                  │ submitContact   │
                                  └─────────────────┘
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │ API Route       │
                                  │ /api/contact    │
                                  └─────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
              Server validation                          Sanitization
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          ▼
                                  ┌─────────────────┐
                                  │  Resend API     │
                                  │  Send email     │
                                  └─────────────────┘
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │  Return result  │
                                  │  {success: true}│
                                  └─────────────────┘
```

### GoogleReviews Data Fetching

```
┌──────────────┐      Request      ┌─────────────────┐
│ Component    │─────────────────►│  useGoogleReviews│
│ useEffect    │                   │  Hook (SWR)      │
└──────────────┘                   └─────────────────┘
                                           │
                                   Check SWR cache
                                           │
                   ┌───────────────────────┴──────────────────┐
                   │ Cache HIT (< 30min)                      │ Cache MISS
                   ▼                                          ▼
           Return cached data                        ┌─────────────────┐
                   │                                 │ API Route       │
                   │                                 │ /api/reviews    │
                   │                                 └─────────────────┘
                   │                                          │
                   │                                  Fetch from Google
                   │                                  Places API
                   │                                          │
                   │                                 ┌─────────────────┐
                   │                                 │  Normalize data │
                   │                                 │  + Cache (30min)│
                   │                                 └─────────────────┘
                   │                                          │
                   └──────────────────┬───────────────────────┘
                                      ▼
                              ┌─────────────────┐
                              │ Return reviews  │
                              │ {reviews: [...]}│
                              └─────────────────┘
                                      │
                                      ▼
                              ┌─────────────────┐
                              │  Render reviews │
                              │  in carousel/grid│
                              └─────────────────┘
```

---

## 🗂️ Component Hierarchy

### Contact Page

```
app/contato/page.tsx (Server Component)
├── Hero Section
├── Main Grid (2 columns)
│   ├── ContactForm (Client Component)
│   │   ├── Form Fields
│   │   │   ├── Name Input
│   │   │   ├── Email Input
│   │   │   ├── Phone Input (with formatter)
│   │   │   ├── Message Textarea
│   │   │   ├── LGPD Consent Checkbox
│   │   │   └── Honeypot (hidden)
│   │   ├── Validation (useTransition)
│   │   ├── Error Summary
│   │   ├── Success Message (AnimatePresence)
│   │   └── Fallback Contacts
│   └── Contact Info Section
│       ├── Phone Card
│       ├── Email Card
│       ├── Address Card
│       ├── Hours Card
│       ├── Responsible Info
│       └── Google Maps Embed
└── Quick Contact CTAs
    ├── WhatsApp Button
    ├── Phone Button
    └── Online Scheduling Button
```

### Profile Pages with Reviews

```
app/[profile]/page.tsx (Server Component)
├── Hero Section
├── Services/Plans Section
├── Trust/Tech Section
├── GoogleReviewsWidget (Client Component) ← NEW
│   ├── Header Section
│   │   ├── Section Title
│   │   └── Quick Contact CTA
│   ├── Stats Display
│   │   ├── Average Rating (⭐)
│   │   └── Total Reviews Count
│   ├── Reviews List
│   │   ├── Mobile: SafeInteractiveCarousel
│   │   │   └── ReviewCard (x3)
│   │   └── Desktop: Grid Layout
│   │       └── ReviewCard (x3)
│   │           ├── Star Rating
│   │           ├── Review Text
│   │           ├── Author Name
│   │           ├── Date (relative)
│   │           └── Avatar Image
│   ├── Loading State (Spinner)
│   ├── Error State (Fallback UI)
│   └── View All Button
└── CTA Section
```

---

## 🛠️ Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Next.js    │  │    React     │  │  TypeScript  │ │
│  │     15.5     │  │      18      │  │     5.x      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Tailwind    │  │Framer Motion │  │  Lucide Icons│ │
│  │     CSS      │  │  (Animations)│  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    State Management                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     SWR      │  │React Context │  │  useTransition│ │
│  │  (Caching)   │  │ (Global State│  │  (Async State)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Next.js API  │  │    Server    │  │   Resend     │ │
│  │    Routes    │  │   Actions    │  │   (Email)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Google Places │  │  Resend API  │  │  Vercel      │ │
│  │     API      │  │              │  │ (Hosting)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimizations

### Contact Page
- ✅ Server-side rendering (SSR)
- ✅ Static metadata
- ✅ Client component hydration (ContactForm only)
- ✅ Lazy loading (Google Maps iframe)
- ✅ Debounced form validation (300ms)
- ✅ Code splitting (automatic)

### GoogleReviewsWidget
- ✅ SWR caching (30min TTL)
- ✅ Optimistic UI updates
- ✅ Lazy loading images
- ✅ Carousel virtualization (mobile)
- ✅ Automatic retry on failure
- ✅ Fallback data (3 static reviews)

---

## 🔐 Security Measures

### ContactForm
- ✅ Server-side validation (duplicate client)
- ✅ Honeypot anti-spam field
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting (via Resend)
- ✅ Input sanitization
- ✅ LGPD consent collection
- ✅ No client-side secrets

### GoogleReviewsWidget
- ✅ API key server-side only
- ✅ CORS restrictions
- ✅ Data normalization/sanitization
- ✅ XSS prevention (React escaping)
- ✅ Rate limiting (Google API)

---

## 📈 Scalability Considerations

1. **Caching Strategy:**
   - Reviews: 30min server cache
   - Static assets: CDN cache
   - API responses: SWR client cache

2. **Code Splitting:**
   - Automatic by Next.js
   - Client components lazy loaded
   - Route-based splitting

3. **Database (Future):**
   - Currently: External APIs only
   - Next: Supabase integration
   - Cache: Redis (optional)

---

**Created:** 2025-10-03
**Version:** 1.0.0
**Status:** ✅ Production Ready
