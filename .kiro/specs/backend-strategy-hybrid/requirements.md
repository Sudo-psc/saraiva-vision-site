# Requirements Document

## Introduction

This feature implements a comprehensive backend modernization strategy for Saraiva Vision (ophthalmology clinic) using a hybrid Vercel + VPS Linux architecture. The system will support corporate website management via headless WordPress, automated podcast synchronization with Spotify, contact form with email delivery via Resend API, appointment scheduling with automated confirmations, operational dashboard, analytics, and WhatsApp chatbot with AI for patient triage.

## Requirements

### Requirement 1

**User Story:** As a marketing team member, I want to manage website content through a headless WordPress CMS, so that I can update pages, blog posts, and clinic information without technical dependencies.

#### Acceptance Criteria

1. WHEN content is published or updated in WordPress THEN the Next.js site SHALL reflect changes within 1 minute via ISR revalidation
2. WHEN accessing the CMS THEN it SHALL be available at cms.saraivavision.com.br with TLS encryption
3. WHEN creating content THEN WordPress SHALL expose data via WPGraphQL API for Next.js consumption
4. WHEN managing content THEN the system SHALL support role-based access (Editor, Admin) with appropriate permissions
5. WHEN content changes occur THEN WordPress SHALL trigger webhooks to notify Next.js for cache invalidation

### Requirement 2

**User Story:** As Dr. Philipe, I want the podcast page to automatically sync with Spotify episodes, so that new episodes appear on the website without manual intervention.

#### Acceptance Criteria

1. WHEN new episodes are published on Spotify THEN the system SHALL sync them to the website within 30 minutes
2. WHEN syncing episodes THEN the system SHALL cache episode data in Postgres for fast loading
3. WHEN displaying episodes THEN the system SHALL show title, description, duration, and embedded player
4. WHEN sync fails THEN the system SHALL log errors and retry with exponential backoff
5. WHEN episodes are updated on Spotify THEN existing cached data SHALL be refreshed accordingly

### Requirement 3

**User Story:** As a potential patient, I want to submit contact inquiries through a reliable form, so that my message reaches Dr. Philipe and I receive confirmation of submission.

#### Acceptance Criteria

1. WHEN submitting the contact form THEN the system SHALL send email via Resend API within 3 seconds
2. WHEN form is submitted THEN patient data SHALL be stored in Postgres for CRM and audit purposes
3. WHEN email delivery fails THEN the system SHALL retry using outbox pattern with exponential backoff
4. WHEN form is accessed THEN it SHALL require LGPD consent before data processing
5. WHEN submission is successful THEN the user SHALL receive immediate confirmation feedback

### Requirement 4

**User Story:** As a patient, I want to schedule appointments online with automatic confirmations, so that I can book consultations conveniently and receive timely reminders.

#### Acceptance Criteria

1. WHEN viewing availability THEN the system SHALL show open slots Monday-Friday 08:00-18:00 in 30-minute intervals
2. WHEN booking an appointment THEN confirmation email and SMS SHALL be sent within 60 seconds
3. WHEN appointment is confirmed THEN the system SHALL schedule reminder notifications for T-24h and T-2h
4. WHEN appointments conflict THEN the system SHALL prevent double-booking and show updated availability
5. WHEN booking fails THEN the system SHALL provide clear error messages and alternative time slots

### Requirement 5

**User Story:** As a clinic administrator, I want an operational dashboard to monitor system health, so that I can track service status, message queues, and appointment metrics in real-time.

#### Acceptance Criteria

1. WHEN accessing the dashboard THEN it SHALL display service uptime, email/SMS delivery rates, and error counts
2. WHEN monitoring queues THEN the system SHALL show pending messages in outbox with retry status
3. WHEN viewing appointments THEN the dashboard SHALL display daily/weekly booking statistics and no-show rates
4. WHEN system errors occur THEN alerts SHALL be visible with severity levels and resolution guidance
5. WHEN accessing metrics THEN data SHALL be refreshed automatically every 30 seconds

### Requirement 6

**User Story:** As Dr. Philipe, I want to track patient engagement through analytics, so that I can understand conversion funnel performance and optimize the patient acquisition process.

#### Acceptance Criteria

1. WHEN patients visit the site THEN the system SHALL track the conversion funnel: visit → contact → appointment → confirmation
2. WHEN analyzing traffic THEN the system SHALL segment data by source (organic, social, campaigns) using UTM parameters
3. WHEN monitoring performance THEN the system SHALL track Core Web Vitals (TTFB, LCP, CLS) and user experience metrics
4. WHEN viewing reports THEN analytics SHALL show appointment completion rates and drop-off points
5. WHEN accessing data THEN all analytics SHALL comply with LGPD requirements for data privacy

### Requirement 7

**User Story:** As a potential patient, I want to interact with an AI chatbot for initial triage, so that I can get immediate answers to common questions and guidance on scheduling appointments.

#### Acceptance Criteria

1. WHEN accessing the chatbot THEN it SHALL provide answers to frequently asked questions about services and procedures
2. WHEN asking medical questions THEN the bot SHALL avoid clinical advice and direct users to schedule consultations
3. WHEN ready to book THEN the chatbot SHALL guide users to the appointment scheduling system
4. WHEN conversations occur THEN the system SHALL log interactions for quality improvement without storing personal data
5. WHEN bot cannot help THEN it SHALL provide clear escalation paths to human contact options

### Requirement 8

**User Story:** As a compliance officer, I want the system to meet LGPD requirements, so that patient privacy is protected and the clinic remains compliant with Brazilian data protection laws.

#### Acceptance Criteria

1. WHEN collecting personal data THEN the system SHALL obtain explicit consent with clear privacy notices
2. WHEN storing patient information THEN data SHALL be encrypted at rest and in transit
3. WHEN processing data THEN the system SHALL implement data minimization and purpose limitation principles
4. WHEN requested THEN the system SHALL provide data anonymization capabilities for patient requests
5. WHEN handling sensitive data THEN access controls SHALL restrict data to authorized personnel only

### Requirement 9

**User Story:** As a system administrator, I want comprehensive observability and monitoring, so that I can proactively identify and resolve issues before they impact patient experience.

#### Acceptance Criteria

1. WHEN system events occur THEN they SHALL be logged centrally with structured format and appropriate detail levels
2. WHEN email/SMS delivery fails THEN the system SHALL generate alerts with failure reasons and retry status
3. WHEN performance degrades THEN monitoring SHALL detect issues and notify administrators within 5 minutes
4. WHEN viewing logs THEN no personally identifiable information SHALL be exposed in log entries
5. WHEN incidents occur THEN the system SHALL provide detailed error context for rapid troubleshooting

### Requirement 10

**User Story:** As Dr. Philipe, I want patients to easily contact the clinic via WhatsApp, so that they can reach us through their preferred communication channel for quick inquiries.

#### Acceptance Criteria

1. WHEN visiting the website THEN a WhatsApp widget SHALL be prominently displayed and easily accessible
2. WHEN clicking WhatsApp THEN it SHALL open a conversation with the clinic's official number
3. WHEN using WhatsApp THEN patients SHALL see a professional greeting message with clinic information
4. WHEN the widget is displayed THEN it SHALL not interfere with website navigation or accessibility
5. WHEN on mobile devices THEN the WhatsApp integration SHALL work seamlessly with the native app