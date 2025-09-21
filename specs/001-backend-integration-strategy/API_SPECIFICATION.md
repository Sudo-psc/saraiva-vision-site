# API Specification

## Overview

This document defines the API endpoints for Saraiva Vision's backend integration, including request/response formats, authentication, error handling, and data validation rules.

## Base URL

- **Production**: `https://saraivavision.com.br/api`
- **Development**: `http://localhost:3000/api`

## Authentication

### Public Endpoints
- `GET /api/availability`
- `POST /api/contact`
- `POST /api/appointments`
- `GET /api/appointments/confirm`
- `POST /api/chatbot`
- `GET /api/podcast/episodes`

### Protected Endpoints (Admin)
- `GET /api/contact/messages`
- `GET /api/status`
- `GET /api/analytics`

### Authentication Method
```typescript
interface AuthHeader {
  Authorization: `Bearer ${supabase_jwt_token}`;
}

interface AdminRole {
  role: 'admin';
  permissions: string[];
}
```

## Response Format

### Standard Response
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

## API Endpoints

### 1. Contact Management

#### POST /api/contact
Submit a contact form message.

**Request Body:**
```typescript
interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
  recaptchaToken?: string;
}
```

**Validation Rules:**
- `name`: 2-100 characters
- `email`: Valid email format
- `phone`: Optional, valid phone number format
- `subject`: 5-200 characters
- `message`: 10-5000 characters
- `consent`: Must be `true`
- `recaptchaToken`: Optional, for spam protection

**Response (201 Created):**
```typescript
interface ContactResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
  created_at: string;
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: Email service down

---

#### GET /api/contact/messages (Admin)
Retrieve contact messages with pagination.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 20, max: 100)
- `status`: 'pending' | 'responded' | 'archived' (optional)
- `search`: String (optional, search in name/email/subject)

**Authentication:** Required (Admin role)

**Response (200 OK):**
```typescript
interface ContactMessagesResponse {
  messages: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
  status: 'pending' | 'responded' | 'archived';
  created_at: string;
  responded_at?: string;
  ip_address?: string;
  user_agent?: string;
}
```

**Error Codes:**
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions

---

### 2. Appointment Management

#### GET /api/availability
Get available appointment time slots.

**Query Parameters:**
- `date`: String (YYYY-MM-DD format, optional)
- `timezone`: String (default: 'America/Sao_Paulo')

**Response (200 OK):**
```typescript
interface AvailabilityResponse {
  date: string;
  timezone: string;
  availableSlots: {
    time: string; // HH:MM format
    available: boolean;
    reason?: string; // if not available
  }[];
  businessHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
  };
}
```

**Business Rules:**
- Available slots: Monday-Friday, 08:00-18:00
- Slot duration: 30 minutes
- Excludes existing appointments
- Excludes past times for current day

---

#### POST /api/appointments
Create a new appointment.

**Request Body:**
```typescript
interface AppointmentRequest {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string; // ISO 8601 format
  notes?: string;
  consent: boolean;
}
```

**Validation Rules:**
- `patient_name`: 2-100 characters
- `patient_email`: Valid email format
- `patient_phone`: Valid phone number format (Brazil)
- `appointment_date`: Future date, within business hours
- `notes`: Optional, max 1000 characters
- `consent`: Must be `true`

**Response (201 Created):**
```typescript
interface AppointmentResponse {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmation_token: string;
  created_at: string;
  notes?: string;
}
```

**Business Logic:**
- Creates appointment with `pending` status
- Generates unique confirmation token
- Triggers confirmation email and SMS
- Creates outbox entries for reminders (T-24h, T-2h)

---

#### GET /api/appointments/confirm
Confirm an appointment using confirmation token.

**Query Parameters:**
- `token`: String (required)

**Response (200 OK):**
```typescript
interface AppointmentConfirmationResponse {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  status: 'confirmed';
  confirmed_at: string;
  reminder_scheduled: boolean;
}
```

**Error Codes:**
- `INVALID_TOKEN`: Invalid or expired confirmation token
- `APPOINTMENT_NOT_FOUND`: Appointment doesn't exist
- `ALREADY_CONFIRMED`: Appointment already confirmed
- `APPOINTMENT_CANCELLED`: Appointment was cancelled

---

#### POST /api/appointments/cancel
Cancel an appointment.

**Request Body:**
```typescript
interface AppointmentCancellationRequest {
  appointment_id: string;
  cancellation_reason?: string;
  email?: string; // For verification
  phone?: string; // For verification
}
```

**Response (200 OK):**
```typescript
interface AppointmentCancellationResponse {
  id: string;
  status: 'cancelled';
  cancelled_at: string;
  cancellation_reason?: string;
  email_cancelled: boolean;
  sms_cancelled: boolean;
}
```

---

### 3. Content Management

#### GET /api/posts
Fetch blog posts from WordPress.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)
- `category`: String (optional)
- `tag`: String (optional)
- `search`: String (optional)

**Response (200 OK):**
```typescript
interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  modified: string;
  author: string;
  categories: Category[];
  tags: Tag[];
  featured_image?: {
    url: string;
    alt_text: string;
    sizes: {
      thumbnail: string;
      medium: string;
      large: string;
    };
  };
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}
```

---

#### GET /api/pages
Fetch static pages from WordPress.

**Query Parameters:**
- `slug`: String (optional, for single page)
- `parent`: Number (optional, for child pages)

**Response (200 OK):**
```typescript
interface PagesResponse {
  pages: Page[];
}

interface Page {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  modified: string;
  parent?: number;
  template?: string;
  seo?: {
    title: string;
    description: string;
  };
}
```

---

### 4. Podcast Management

#### GET /api/podcast/episodes
Fetch podcast episodes.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 20, max: 50)
- `sort`: 'date' | 'title' | 'duration' (default: 'date')
- `order`: 'asc' | 'desc' (default: 'desc')

**Response (200 OK):**
```typescript
interface PodcastEpisodesResponse {
  episodes: PodcastEpisode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PodcastEpisode {
  id: string;
  spotify_id: string;
  title: string;
  description: string;
  audio_url: string;
  duration: number; // seconds
  published_at: string;
  image_url: string;
  explicit: boolean;
  created_at: string;
  updated_at: string;
}
```

---

#### POST /api/podcast/sync (Cron)
Sync podcast episodes with Spotify API.

**Authentication:** Required (Internal)

**Request Body:**
```typescript
interface PodcastSyncRequest {
  force?: boolean; // Force full sync
}
```

**Response (200 OK):**
```typescript
interface PodcastSyncResponse {
  synced_episodes: number;
  new_episodes: number;
  updated_episodes: number;
  errors: string[];
  sync_duration: number; // seconds
}
```

---

### 5. Messaging System

#### POST /api/outbox/drain (Cron)
Process pending messages from outbox.

**Authentication:** Required (Internal)

**Response (200 OK):**
```typescript
interface OutboxDrainResponse {
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
  errors: string[];
  processing_time: number; // seconds
}
```

---

#### POST /api/webhooks/resend
Handle Resend email delivery status.

**Request Body:**
```typescript
interface ResendWebhookPayload {
  type: 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
  email: string;
  timestamp: string;
  message_id: string;
  [key: string]: any;
}
```

**Response (200 OK):**
```typescript
interface WebhookResponse {
  received: boolean;
  processed: boolean;
  message_id: string;
  status: string;
}
```

---

#### POST /api/webhooks/zenvia
Handle Zenvia SMS delivery status.

**Request Body:**
```typescript
interface ZenviaWebhookPayload {
  id: string;
  status: 'delivered' | 'failed' | 'sent';
  timestamp: string;
  phoneNumber: string;
  [key: string]: any;
}
```

**Response (200 OK):**
```typescript
interface WebhookResponse {
  received: boolean;
  processed: boolean;
  message_id: string;
  status: string;
}
```

---

### 6. Chatbot

#### POST /api/chatbot
AI-powered customer service chatbot.

**Request Body:**
```typescript
interface ChatbotRequest {
  message: string;
  conversation_id?: string;
  user_data?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  context?: string;
}
```

**Validation Rules:**
- `message`: 1-1000 characters
- `conversation_id`: Optional, existing conversation ID
- `user_data`: Optional, user information
- `context`: Optional, conversation context

**Response (200 OK):**
```typescript
interface ChatbotResponse {
  response: string;
  conversation_id: string;
  intent: string;
  confidence: number;
  suggestions?: string[];
  actions?: {
    type: 'schedule_appointment' | 'contact_form' | 'redirect';
    data: any;
  }[];
  metadata: {
    response_time: number;
    model: string;
    tokens_used: number;
  };
}
```

**Supported Intents:**
- `greeting`: Welcome messages
- `appointment_booking`: Schedule appointments
- `contact_information`: Clinic details
- `service_inquiry`: Information about services
- `operating_hours': Clinic hours
- `insurance_information`: Insurance accepted
- `emergency_contact`: Emergency procedures
- `general_inquiry`: General questions

---

### 7. Dashboard & Analytics

#### GET /api/status (Admin)
System health and status metrics.

**Authentication:** Required (Admin role)

**Response (200 OK):**
```typescript
interface SystemStatusResponse {
  overall_health: 'healthy' | 'warning' | 'critical';
  components: {
    database: 'online' | 'offline' | 'degraded';
    wordpress: 'online' | 'offline' | 'degraded';
    email_service: 'online' | 'offline' | 'degraded';
    sms_service: 'online' | 'offline' | 'degraded';
    spotify_api: 'online' | 'offline' | 'degraded';
  };
  metrics: {
    appointments_today: number;
    contacts_today: number;
    messages_pending: number;
    messages_failed: number;
    uptime: number; // percentage
    response_time: number; // milliseconds
  };
  alerts: {
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }[];
  last_updated: string;
}
```

---

#### GET /api/analytics (Admin)
Business analytics and metrics.

**Authentication:** Required (Admin role)

**Query Parameters:**
- `start_date`: String (YYYY-MM-DD format)
- `end_date`: String (YYYY-MM-DD format)
- `metric`: 'contacts' | 'appointments' | 'conversions' | 'engagement' (optional)

**Response (200 OK):**
```typescript
interface AnalyticsResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    contacts: {
      total: number;
      by_source: Record<string, number>;
      conversion_rate: number;
      average_response_time: number;
    };
    appointments: {
      total: number;
      confirmed: number;
      cancelled: number;
      no_show: number;
      confirmation_rate: number;
      average_lead_time: number;
    };
    conversions: {
      contact_to_appointment: number;
      appointment_to_confirmation: number;
      overall_funnel: number;
    };
    engagement: {
      website_visitors: number;
      chatbot_interactions: number;
      podcast_downloads: number;
      average_session_duration: number;
    };
  };
  trends: {
    date: string;
    contacts: number;
    appointments: number;
    conversions: number;
  }[];
}
```

---

## Error Codes Reference

### Client Errors (4xx)
- `400 BAD_REQUEST`: Invalid request format
- `401 UNAUTHORIZED`: Authentication required
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `422 VALIDATION_ERROR`: Request validation failed
- `429 RATE_LIMIT_EXCEEDED`: Too many requests

### Server Errors (5xx)
- `500 INTERNAL_SERVER_ERROR`: Unexpected server error
- `502 BAD_GATEWAY`: Upstream service unavailable
- `503 SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `504 GATEWAY_TIMEOUT`: Upstream service timeout

### Business Logic Errors
- `INVALID_TOKEN`: Invalid or expired token
- `APPOINTMENT_NOT_FOUND`: Appointment doesn't exist
- `APPOINTMENT_CONFLICT`: Time slot not available
- `APPOINTMENT_CANCELLED`: Appointment was cancelled
- `ALREADY_CONFIRMED`: Already confirmed
- `TIME_SLOT_UNAVAILABLE`: Requested time not available
- `SERVICE_UNAVAILABLE`: External service down
- `DATABASE_ERROR`: Database operation failed

## Rate Limiting

### Default Limits
- **Public endpoints**: 100 requests per IP per hour
- **Authenticated endpoints**: 1000 requests per user per hour
- **Webhook endpoints**: No rate limiting (with authentication)

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Content Revalidation
**Endpoint**: `POST /api/webhooks/wp-revalidate`
**Purpose**: Revalidate cached content when WordPress is updated

**Request Body:**
```typescript
interface WordPressWebhook {
  secret: string;
  post_id?: number;
  post_type: 'post' | 'page';
  action: 'published' | 'updated' | 'deleted';
}
```

### Email Delivery Status
**Endpoint**: `POST /api/webhooks/resend`
**Purpose**: Track email delivery status from Resend

### SMS Delivery Status
**Endpoint**: `POST /api/webhooks/zenvia`
**Purpose**: Track SMS delivery status from Zenvia

## Data Validation Schemas

### Contact Form Schema
```typescript
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/, 'Invalid phone number').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
  recaptchaToken: z.string().optional(),
});
```

### Appointment Schema
```typescript
export const appointmentSchema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  patient_email: z.string().email('Invalid email address'),
  patient_phone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/, 'Invalid phone number'),
  appointment_date: z.string().refine((date) => {
    const appointmentDate = new Date(date);
    const now = new Date();
    return appointmentDate > now && !isNaN(appointmentDate.getTime());
  }, 'Appointment date must be in the future'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
});
```

## Testing

### API Testing Examples

#### Contact Form Submission
```bash
curl -X POST https://saraivavision.com.br/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+55 11 99999-9999",
    "subject": "Appointment Inquiry",
    "message": "I would like to schedule an appointment for an eye examination.",
    "consent": true
  }'
```

#### Get Availability
```bash
curl -X GET "https://saraivavision.com.br/api/availability?date=2024-01-15&timezone=America/Sao_Paulo"
```

#### Create Appointment
```bash
curl -X POST https://saraivavision.com.br/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Jane Smith",
    "patient_email": "jane@example.com",
    "patient_phone": "+55 11 99999-8888",
    "appointment_date": "2024-01-15T14:00:00.000Z",
    "consent": true
  }'
```

---

This API specification provides a comprehensive guide for implementing and integrating with Saraiva Vision's backend services. All endpoints follow RESTful principles and include proper validation, error handling, and security measures.