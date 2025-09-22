# Phase 1 Data Model: VPS Migration with Docker Containers

## Overview

This document defines the data models, entities, and relationships for the VPS migration project, including the migration from Supabase to WordPress/MySQL and the containerized architecture.

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   WordPress     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Headless)    │
│                 │    │                 │    │                 │
│ - User State    │    │ - API Endpoints│    │ - Content Mgmt  │
│ - UI Components │    │ - Business Logic│    │ - Media Library │
│ - Client Routes │    │ - Auth Bridge   │    │ - User Roles    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MySQL 8.0)   │
                    │                 │
                    │ - Contact Forms │
                    │ - Appointments  │
                    │ - Profiles      │
                    │ - Podcasts      │
                    │ - Event Logs    │
                    └─────────────────┘
```

## Data Entities

### 1. WordPress Core Entities (Migrated/Enhanced)

#### wp_posts
```typescript
interface WordPressPost {
  ID: number;                  // Primary key
  post_author: number;         // User ID who created
  post_date: string;          // ISO datetime
  post_content: string;       // HTML content
  post_title: string;         // Post title
  post_excerpt: string;       // Summary
  post_status: 'publish' | 'draft' | 'pending';
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  post_password: string;      // Password protection
  post_name: string;          // URL slug
  to_ping: string;
  pinged: string;
  post_modified: string;      // Last modified
  post_content_filtered: string;
  post_parent: number;        // Parent post ID
  guid: string;               // Global unique ID
  menu_order: number;
  post_type: string;          // 'post', 'page', 'service', 'doctor', etc.
  post_mime_type: string;
  comment_count: number;

  // Custom fields (postmeta)
  meta: {
    featured_image?: string;  // Media URL
    seo_title?: string;
    seo_description?: string;
    service_duration?: number; // For services
    doctor_specialty?: string; // For doctors
    appointment_available?: boolean;
  };
}
```

#### wp_users
```typescript
interface WordPressUser {
  ID: number;                  // Primary key
  user_login: string;         // Username
  user_pass: string;          // Hashed password
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: string;    // Registration datetime
  user_activation_key: string;
  user_status: number;
  display_name: string;

  // User capabilities
  capabilities: {
    administrator: boolean;
    editor: boolean;
    author: boolean;
    contributor: boolean;
    subscriber: boolean;
    clinic_staff: boolean;     // Custom role
  };
}
```

#### wp_postmeta
```typescript
interface PostMeta {
  meta_id: number;
  post_id: number;            // Foreign key to wp_posts
  meta_key: string;
  meta_value: string;
}
```

### 2. Custom Post Types (Clinic-Specific)

#### Services (Custom Post Type: 'service')
```typescript
interface ClinicService {
  // WordPress base fields
  ID: number;
  post_title: string;         // Service name
  post_content: string;       // Service description
  post_excerpt: string;       // Short description

  // Custom fields
  service_data: {
    duration: number;         // Minutes (30, 45, 60, 90)
    price: number;            // BRL
    category: 'consultation' | 'exam' | 'surgery' | 'treatment';
    requires_appointment: boolean;
    age_group: 'children' | 'adults' | 'seniors' | 'all';
    insurance_accepted: string[];
    prerequisites?: string;
    recovery_time?: string;
    technology_used?: string;
  };

  // Relationships
  doctors: number[];         // Associated doctor IDs
  related_services: number[]; // Related service IDs
}
```

#### Doctors (Custom Post Type: 'doctor')
```typescript
interface ClinicDoctor {
  // WordPress base fields
  ID: number;
  post_title: string;         // Doctor name
  post_content: string;       // Biography

  // Custom fields
  doctor_data: {
    specialty: string;        // Medical specialty
    crm: string;             // Medical council number
    education: string[];      // Education background
    experience_years: number;
    languages: string[];     // Languages spoken
    consultation_types: ('in-person' | 'online')[];
    available_days: string[]; // ['Monday', 'Tuesday', etc.]
    photo_gallery: string[]; // Media URLs
  };

  // Relationships
  services: number[];        // Associated service IDs
  schedule: DoctorSchedule[];
}
```

#### Appointments (Custom Post Type: 'appointment')
```typescript
interface Appointment {
  // WordPress base fields
  ID: number;
  post_title: string;        // Auto-generated: "Appointment with [Doctor] - [Date]"

  // Custom fields
  appointment_data: {
    patient_id: number;      // WordPress user ID
    doctor_id: number;       // Doctor post ID
    service_id: number;      // Service post ID
    datetime: string;        // ISO datetime
    duration: number;        // Minutes
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    notes?: string;
    price: number;           // BRL
    insurance_info?: string;
  };

  // Relationships
  patient: WordPressUser;
  doctor: ClinicDoctor;
  service: ClinicService;
}
```

### 3. Migrated Entities (From Supabase)

#### Contact Messages (wp_posts type: 'contact_message')
```typescript
interface ContactMessage {
  // WordPress base fields
  ID: number;
  post_title: string;        // Auto-generated: "Contact from [Name]"
  post_content: string;      // Message content

  // Custom fields (migrated from Supabase)
  contact_data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    source: 'website' | 'whatsapp' | 'email';
    status: 'new' | 'read' | 'responded' | 'archived';
    assigned_to?: number;    // Staff user ID
  };

  // Timestamps
  created_at: string;
  updated_at: string;
}
```

#### Podcast Episodes (wp_posts type: 'podcast')
```typescript
interface PodcastEpisode {
  // WordPress base fields
  ID: number;
  post_title: string;        // Episode title
  post_content: string;      // Show notes
  post_excerpt: string;      // Episode description

  // Custom fields (migrated from Supabase)
  podcast_data: {
    episode_number: number;
    duration: number;        // Seconds
    audio_url: string;       // Media file URL
    spotify_url?: string;
    apple_podcasts_url?: string;
    google_podcasts_url?: string;
    published_at: string;
    guests?: string[];
    topics: string[];
  };

  // Relationships
  categories: number[];     // WordPress category IDs
  tags: number[];           // WordPress tag IDs
}
```

### 4. System Entities

#### Event Log (Custom Table)
```typescript
interface EventLog {
  id: number;                // Primary key
  event_type: string;        // 'user_action', 'system', 'error', 'migration'
  event_name: string;        // Specific event name
  user_id?: number;          // Associated user ID
  ip_address?: string;
  user_agent?: string;
  payload: object;           // Event-specific data
  created_at: string;

  // For debugging and monitoring
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: 'frontend' | 'backend' | 'wordpress' | 'database';
}
```

#### Media Library (WordPress Core + Custom)
```typescript
interface MediaItem {
  ID: number;                // WordPress attachment ID
  post_title: string;        // File name
  guid: string;              // Public URL
  post_mime_type: string;    // MIME type
  file_path: string;         // Server path
  file_size: number;         // Bytes
  dimensions?: {             // For images
    width: number;
    height: number;
  };

  // Custom fields
  media_data: {
    alt_text?: string;
    caption?: string;
    description?: string;
    usage_count: number;
    last_used: string;
    optimization_status: 'original' | 'optimized' | 'compressed';
  };

  // Relationships
  attached_to?: number[];   // Post IDs using this media
}
```

## Database Schema Design

### WordPress Core Tables (Extended)
```sql
-- Custom tables for clinic functionality
CREATE TABLE clinic_appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  appointment_datetime DATETIME NOT NULL,
  duration INT NOT NULL DEFAULT 30,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show') DEFAULT 'pending',
  price DECIMAL(10,2),
  notes TEXT,
  insurance_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (post_id) REFERENCES wp_posts(ID) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES wp_users(ID) ON DELETE CASCADE,

  INDEX idx_appointment_datetime (appointment_datetime),
  INDEX idx_patient_id (patient_id),
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_status (status)
);

CREATE TABLE clinic_doctor_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  max_appointments INT DEFAULT 4,

  FOREIGN KEY (doctor_id) REFERENCES wp_posts(ID) ON DELETE CASCADE,

  UNIQUE KEY unique_schedule (doctor_id, day_of_week, start_time)
);

CREATE TABLE clinic_service_doctor_mapping (
  service_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (service_id) REFERENCES wp_posts(ID) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES wp_posts(ID) ON DELETE CASCADE,

  PRIMARY KEY (service_id, doctor_id)
);

-- Event logging table
CREATE TABLE event_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  user_id BIGINT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  payload JSON,
  severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
  source VARCHAR(20) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_severity (severity),
  INDEX idx_user_id (user_id)
);
```

## Migration Mapping (Supabase to WordPress)

### Supabase → WordPress Migration Plan

```typescript
// Supabase contact_messages → WordPress contact_messages
interface ContactMessageMigration {
  supabase: {
    id: number;
    created_at: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    source: string;
    status: string;
    assigned_to?: number;
  };

  wordpress: {
    post_type: 'contact_message';
    post_title: `Contact from ${name}`;
    post_content: message;
    post_author: assigned_to || 1;
    post_status: 'private'; // Not publicly visible

    meta: {
      contact_name: name;
      contact_email: email;
      contact_phone: phone;
      contact_subject: subject;
      contact_source: source;
      contact_status: status;
      original_created_at: created_at;
    };
  };
}

// Supabase appointments → WordPress appointments
interface AppointmentMigration {
  supabase: {
    id: number;
    created_at: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    doctor_id: number;
    service_id: number;
    appointment_datetime: string;
    duration: number;
    status: string;
    notes?: string;
    price: number;
  };

  wordpress: {
    post_type: 'appointment';
    post_title: `Appointment with ${doctor_name} - ${formatDate(appointment_datetime)}`;
    post_author: 1; // System user
    post_status: 'private';

    meta: {
      patient_name: patient_name;
      patient_email: patient_email;
      patient_phone: patient_phone;
      doctor_id: doctor_id; // New WordPress post ID
      service_id: service_id; // New WordPress post ID
      appointment_datetime: appointment_datetime;
      duration: duration;
      status: status;
      notes: notes;
      price: price;
      original_id: id;
      original_created_at: created_at;
    };
  };
}
```

## API Contracts

### REST API Endpoints Structure

```
/api/v1/
├── /auth/
│   ├── POST /login
│   ├── POST /logout
│   ├── GET /profile
│   └── PUT /profile
├── /appointments/
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /services/
│   ├── GET /
│   ├── GET /{id}
│   └── GET /{id}/doctors
├── /doctors/
│   ├── GET /
│   ├── GET /{id}
│   ├── GET /{id}/schedule
│   └── GET /{id}/services
├── /contact/
│   ├── POST /
│   └── GET /admin (admin only)
├── /podcast/
│   ├── GET /
│   ├── GET /{id}
│   └── GET /latest
└── /admin/
    ├── GET /stats
    ├── GET /logs
    └── POST /migrate/status
```

### Data Validation Rules

#### Appointment Validation
```typescript
const appointmentValidation = {
  patient_name: { required: true, minLength: 3, maxLength: 100 },
  patient_email: { required: true, format: 'email' },
  patient_phone: { required: true, format: 'phone' },
  doctor_id: { required: true, exists: 'doctors' },
  service_id: { required: true, exists: 'services' },
  appointment_datetime: { required: true, future: true },
  duration: { required: true, min: 15, max: 180 },
  price: { required: true, min: 0 },
  notes: { maxLength: 1000 }
};
```

#### Service Validation
```typescript
const serviceValidation = {
  post_title: { required: true, minLength: 5, maxLength: 200 },
  post_content: { required: true, minLength: 50 },
  service_duration: { required: true, enum: [30, 45, 60, 90, 120] },
  service_price: { required: true, min: 0 },
  service_category: { required: true, enum: ['consultation', 'exam', 'surgery', 'treatment'] },
  requires_appointment: { required: true, type: 'boolean' }
};
```

## Security and Access Control

### User Roles and Capabilities
```typescript
interface UserRoleCapabilities {
  super_admin: {
    can_manage_users: true,
    can_manage_content: true,
    can_manage_appointments: true,
    can_view_analytics: true,
    can_configure_system: true
  };

  administrator: {
    can_manage_content: true,
    can_manage_appointments: true,
    can_view_analytics: true
  };

  clinic_staff: {
    can_manage_appointments: true,
    can_view_contact_messages: true,
    can_edit_services: true
  };

  editor: {
    can_manage_content: true
  };

  subscriber: {
    can_book_appointments: true,
    can_contact_clinic: true
  };
}
```

### Data Access Patterns
```typescript
// Authentication middleware
interface AuthContext {
  user: WordPressUser | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasCapability: (capability: string) => boolean;
}

// Access control examples
const appointmentAccess = {
  // Anyone can book appointment
  create: () => true,

  // Users can see their own appointments
  read: (user, appointment) => {
    return user.ID === appointment.patient_id ||
           user.hasCapability('manage_appointments');
  },

  // Only staff can update appointments
  update: (user) => user.hasCapability('manage_appointments'),

  // Only staff can delete appointments
  delete: (user) => user.hasCapability('manage_appointments')
};
```

This data model provides a comprehensive foundation for the VPS migration, ensuring all existing functionality is preserved while enabling WordPress integration and proper containerization.