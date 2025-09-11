# Data Model: Resend Email Integration

## Core Entities

### ContactSubmission
```typescript
interface ContactSubmission {
  // Patient Information (required for medical contact)
  name: string;           // Full name, 2-100 characters, sanitized
  email: string;          // Valid email format, normalized lowercase
  phone?: string;         // Optional Brazilian phone format (+55 XX XXXXX-XXXX)
  message: string;        // Inquiry text, 10-1000 characters, sanitized
  
  // Legal & Compliance
  consent: boolean;       // LGPD consent required (must be true)
  
  // System Metadata
  timestamp: string;      // ISO 8601 submission timestamp
  userAgent: string;      // Client info for logging/debugging
  ipAddress: string;      // Hashed IP for rate limiting (privacy-safe)
  submissionId: string;   // UUID for tracking and support
  
  // Honeypot (spam detection)
  website?: string;       // Hidden field, should be empty
}
```

### EmailTemplate
```typescript
interface EmailTemplate {
  // Recipient
  to: string;             // Dr. Philipe's email address
  from: string;           // Clinic's verified sender address
  
  // Content
  subject: string;        // Professional subject line template
  html: string;           // Rich HTML email content
  text: string;           // Plain text fallback
  
  // Metadata
  templateVersion: string; // Template version for A/B testing
  priority: 'normal' | 'high'; // Email priority level
  
  // Tracking
  tags: string[];         // Categorization tags for analytics
  metadata: Record<string, string>; // Additional tracking data
}
```

### APIResponse
```typescript
interface APIResponse {
  success: boolean;       // Operation success status
  message: string;        // User-friendly response message
  
  // Success data
  submissionId?: string;  // Tracking ID for successful submissions
  estimatedDelivery?: string; // Expected delivery time
  
  // Error data
  error?: string;         // Error type (sanitized for security)
  code?: string;          // Error code for client handling
  retryAfter?: number;    // Seconds to wait before retry (rate limiting)
  
  // Validation errors
  fieldErrors?: Record<string, string[]>; // Field-specific validation errors
}
```

### RateLimitState
```typescript
interface RateLimitState {
  ipHash: string;         // SHA-256 hash of IP address
  submissions: number;    // Current submission count
  windowStart: string;    // Rate limit window start time
  windowDuration: number; // Window duration in milliseconds
  maxSubmissions: number; // Maximum allowed submissions per window
  
  // Metadata
  lastSubmission: string; // Timestamp of last submission
  userAgent: string;      // User agent for pattern detection
  blocked: boolean;       // Whether IP is currently blocked
  blockReason?: string;   // Reason for blocking (spam, abuse, etc.)
}
```

## Validation Rules

### ContactSubmission Validation
```typescript
import { z } from 'zod';

const ContactSubmissionSchema = z.object({
  // Required fields with business rules
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Name contains invalid characters'),
    
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email address too long')
    .toLowerCase(),
    
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must not exceed 1000 characters')
    .trim(),
    
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Privacy consent is required' })
  }),
  
  // Optional fields
  phone: z.string()
    .regex(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/, 'Invalid Brazilian phone format')
    .optional()
    .or(z.literal('')),
    
  // Honeypot (should be empty)
  website: z.string().max(0, 'Spam detected').optional(),
  
  // System fields (added by server)
  timestamp: z.string().datetime().optional(),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().max(64).optional(),
  submissionId: z.string().uuid().optional()
});

// Export type from schema
export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;
```

### Email Template Validation
```typescript
const EmailTemplateSchema = z.object({
  to: z.string().email('Invalid recipient email'),
  from: z.string().email('Invalid sender email'),
  
  subject: z.string()
    .min(5, 'Subject too short')
    .max(100, 'Subject too long'),
    
  html: z.string()
    .min(50, 'HTML content too short')
    .max(100000, 'HTML content too large'),
    
  text: z.string()
    .min(20, 'Text content too short')
    .max(10000, 'Text content too large'),
    
  templateVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  priority: z.enum(['normal', 'high']).default('normal'),
  
  tags: z.array(z.string()).max(10, 'Too many tags'),
  metadata: z.record(z.string(), z.string())
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
```

## State Transitions

### Form Submission Workflow
```typescript
type SubmissionState = 
  | 'idle'           // Form ready for input
  | 'validating'     // Client-side validation in progress
  | 'submitting'     // API request in progress
  | 'success'        // Email sent successfully
  | 'error'          // Submission failed
  | 'rate_limited'   // Rate limit exceeded
  | 'blocked';       // IP blocked for spam

const stateTransitions = {
  idle: ['validating'],
  validating: ['submitting', 'error'],
  submitting: ['success', 'error', 'rate_limited'],
  success: ['idle'],           // After form reset
  error: ['idle', 'validating'], // Retry allowed
  rate_limited: ['idle'],      // After timeout
  blocked: []                  // No transitions (manual unblock)
};
```

### Email Delivery States
```typescript
type DeliveryState = 
  | 'pending'        // Email queued for sending
  | 'sent'          // Email sent to provider
  | 'delivered'     // Email delivered to recipient
  | 'bounced'       // Email bounced (invalid address)
  | 'failed'        // Permanent delivery failure
  | 'spam'          // Marked as spam
  | 'opened'        // Email opened by recipient
  | 'clicked';      // Link clicked in email

// Webhook handling for delivery status updates
interface DeliveryEvent {
  submissionId: string;
  state: DeliveryState;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

## Data Transformations

### Input Sanitization
```typescript
// Multi-layer sanitization for security
const sanitizeInput = (input: string): string => {
  return input
    .trim()                           // Remove whitespace
    .replace(/\s+/g, ' ')            // Normalize spaces
    .replace(/[<>]/g, '')            // Remove potential HTML
    .substring(0, 1000);             // Enforce length limit
};

// Email-safe sanitization for templates
const sanitizeForEmail = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')          // Escape ampersands
    .replace(/</g, '&lt;')           // Escape less than
    .replace(/>/g, '&gt;')           // Escape greater than
    .replace(/"/g, '&quot;')         // Escape quotes
    .replace(/'/g, '&#x27;');        // Escape apostrophes
};
```

### Template Data Mapping
```typescript
// Transform form data for email template
const mapToEmailData = (submission: ContactSubmission) => ({
  patientName: sanitizeForEmail(submission.name),
  patientEmail: submission.email, // Already validated
  patientPhone: submission.phone ? formatPhone(submission.phone) : 'Not provided',
  patientMessage: sanitizeForEmail(submission.message),
  submissionDate: new Date(submission.timestamp).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short'
  }),
  submissionId: submission.submissionId,
  
  // Clinic information
  clinicName: 'SaraivaVision',
  clinicEmail: 'contato@saraivavision.com.br',
  clinicPhone: '+55 11 XXXX-XXXX',
  clinicAddress: 'São Paulo, SP'
});

// Brazilian phone number formatting
const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 13) { // +55 XX XXXXX-XXXX
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9)}`;
  }
  return phone; // Return original if format doesn't match
};
```

## Relationships & Dependencies

### Entity Relationships
```
ContactSubmission (1) → EmailTemplate (1)
    ↓
APIResponse (1)
    ↓
DeliveryEvent (0..n)

RateLimitState (n) ← IPAddress → ContactSubmission (n)
```

### Data Flow
```
1. Browser Form → ContactSubmission
2. Server Validation → ContactSubmissionSchema
3. Rate Limit Check → RateLimitState
4. Email Generation → EmailTemplate
5. Resend API Call → APIResponse
6. Webhook Events → DeliveryEvent
```

## Storage Strategy

### No Persistent Storage
```typescript
// Data flow without database storage (LGPD compliance)
const processContactSubmission = async (formData: ContactSubmission) => {
  // 1. Validate input (in-memory only)
  const validated = ContactSubmissionSchema.parse(formData);
  
  // 2. Check rate limits (in-memory cache with TTL)
  await checkRateLimit(validated.ipAddress);
  
  // 3. Generate email (in-memory template rendering)
  const emailData = generateEmailTemplate(validated);
  
  // 4. Send email (direct API call)
  const result = await sendEmail(emailData);
  
  // 5. Return response (no data persistence)
  return result;
  
  // Data is garbage collected after response
  // No PII stored anywhere in the system
};
```

### Rate Limiting Cache
```typescript
// In-memory rate limiting with TTL (not persistent)
interface RateLimitCache {
  [ipHash: string]: {
    count: number;
    windowStart: number;
    ttl: number; // Time to live
  };
}

// Cleanup expired entries periodically
const cleanupRateLimit = () => {
  const now = Date.now();
  Object.keys(rateLimitCache).forEach(key => {
    if (rateLimitCache[key].ttl < now) {
      delete rateLimitCache[key];
    }
  });
};
```

## Error Handling

### Validation Error Mapping
```typescript
// Map Zod validation errors to user-friendly messages
const mapValidationErrors = (error: z.ZodError): Record<string, string[]> => {
  return error.errors.reduce((acc, err) => {
    const field = err.path.join('.');
    if (!acc[field]) acc[field] = [];
    acc[field].push(err.message);
    return acc;
  }, {} as Record<string, string[]>);
};

// Example error response
const validationErrorResponse = {
  success: false,
  message: 'Please correct the errors below',
  fieldErrors: {
    email: ['Invalid email format'],
    message: ['Message must be at least 10 characters'],
    consent: ['Privacy consent is required']
  }
};
```

This data model provides a comprehensive foundation for secure, compliant, and performant email delivery integration while maintaining simplicity and following constitutional principles.