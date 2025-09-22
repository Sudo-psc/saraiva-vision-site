# Tasks: VPS Migration with Docker Containers and WordPress Integration

**Input**: Design documents from `/specs/006-vps-migration-docker-wordpress/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: tech stack (Docker, Nginx, WordPress, MySQL), structure (containerized web app)
2. Load design documents:
   → data-model.md: Extract entities (WordPress posts, users, appointments, etc.) → model tasks
   → contracts/api.yaml: Extract API endpoints → contract test tasks
   → research.md: Extract migration phases → setup tasks
   → quickstart.md: Extract deployment scenarios → integration test tasks
3. Generate tasks by category:
   → Setup: VPS provisioning, Docker configuration, project structure
   → Tests: contract tests, integration tests, migration tests
   → Core: Docker containers, WordPress setup, database migration
   → Integration: Nginx configuration, SSL setup, service communication
   → Polish: performance optimization, monitoring, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Containerized web app**: `frontend/`, `backend/`, `wordpress/`, `database/`, `proxy/`
- **Docker configuration**: Dockerfiles in component directories, `docker-compose.yml` at root
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`

## Phase 3.1: Infrastructure Setup
- [ ] T001 Create containerized project structure per implementation plan
- [ ] T002 Initialize VPS server with Ubuntu 22.04 LTS and Docker
- [ ] T003 [P] Configure UFW firewall and fail2ban security
- [ ] T004 [P] Setup Docker and Docker Compose on VPS
- [ ] T005 Create deployment user with sudo and docker group access
- [ ] T006 Setup SSL certificate directories and permissions

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (from OpenAPI spec)
- [ ] T007 [P] Contract test POST /api/v1/auth/login in tests/contract/test_auth_login.js
- [ ] T008 [P] Contract test GET /api/v1/auth/profile in tests/contract/test_auth_profile.js
- [ ] T009 [P] Contract test POST /api/v1/appointments in tests/contract/test_appointments_post.js
- [ ] T010 [P] Contract test GET /api/v1/appointments in tests/contract/test_appointments_get.js
- [ ] T011 [P] Contract test PUT /api/v1/appointments/{id} in tests/contract/test_appointments_put.js
- [ ] T012 [P] Contract test GET /api/v1/services in tests/contract/test_services_get.js
- [ ] T013 [P] Contract test GET /api/v1/doctors in tests/contract/test_doctors_get.js
- [ ] T014 [P] Contract test POST /api/v1/contact in tests/contract/test_contact_post.js
- [ ] T015 [P] Contract test GET /api/v1/podcast in tests/contract/test_podcast_get.js
- [ ] T016 [P] Contract test GET /api/v1/admin/stats in tests/contract/test_admin_stats.js

### Integration Tests
- [ ] T017 [P] Integration test VPS provisioning workflow in tests/integration/test_vps_setup.js
- [ ] T018 [P] Integration test Docker container startup sequence in tests/integration/test_docker_startup.js
- [ ] T019 [P] Integration test WordPress installation and configuration in tests/integration/test_wordpress_setup.js
- [ ] T020 [P] Integration test database migration from Supabase to MySQL in tests/integration/test_db_migration.js
- [ ] T021 [P] Integration test Nginx SSL termination and routing in tests/integration/test_nginx_routing.js
- [ ] T022 [P] Integration test appointment booking end-to-end flow in tests/integration/test_appointment_flow.js
- [ ] T023 [P] Integration test zero-downtime deployment process in tests/integration/test_zero_downtime.js

### Migration Tests
- [ ] T024 [P] Test Supabase data export integrity in tests/migration/test_data_export.js
- [ ] T025 [P] Test MySQL schema creation and constraints in tests/migration/test_mysql_schema.js
- [ ] T026 [P] Test WordPress custom post type registration in tests/migration/test_wordpress_cpt.js
- [ ] T027 [P] Test data transformation and import process in tests/migration/test_data_import.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Docker Infrastructure
- [ ] T028 [P] Create frontend React/Vite Dockerfile in frontend/Dockerfile
- [ ] T029 [P] Create backend Node.js API Dockerfile in backend/Dockerfile
- [ ] T030 [P] Create WordPress PHP-FPM Dockerfile in wordpress/Dockerfile
- [ ] T031 [P] Create MySQL 8.0 Dockerfile in database/Dockerfile
- [ ] T032 [P] Create Nginx reverse proxy Dockerfile in proxy/Dockerfile
- [ ] T033 [P] Create docker-compose.yml with all service definitions
- [ ] T034 [P] Create docker-compose.override.yml for development environment

### WordPress Setup and Configuration
- [ ] T035 [P] Setup WordPress custom post types (service, doctor, appointment) in wordpress/wp-content/mu-plugins/custom-post-types.php
- [ ] T036 [P] Setup WordPress custom fields and meta boxes in wordpress/wp-content/plugins/clinic-fields/clinic-fields.php
- [ ] T037 [P] Configure WordPress REST API authentication and endpoints in wordpress/wp-content/mu-plugins/rest-api-config.php
- [ ] T038 [P] Create WordPress user roles and capabilities in wordpress/wp-content/mu-plugins/user-roles.php
- [ ] T039 [P] Setup WordPress media library optimizations in wordpress/wp-content/mu-plugins/media-optimization.php

### Database Schema and Migration
- [ ] T040 [P] Create MySQL schema for clinic appointments in database/init/01_clinic_appointments.sql
- [ ] T041 [P] Create MySQL schema for doctor schedules in database/init/02_doctor_schedules.sql
- [ ] T042 [P] Create MySQL schema for service mappings in database/init/03_service_mappings.sql
- [ ] T043 [P] Create event logging system schema in database/init/04_event_logging.sql
- [ ] T044 [P] Create database migration script from Supabase to MySQL in scripts/migrate-supabase-to-mysql.sh

### API Endpoints Implementation
- [ ] T045 POST /api/v1/auth/login endpoint implementation
- [ ] T046 GET /api/v1/auth/profile endpoint implementation
- [ ] T047 PUT /api/v1/auth/profile endpoint implementation
- [ ] T048 POST /api/v1/appointments endpoint implementation
- ] T049 GET /api/v1/appointments endpoint implementation
- [ ] T050 PUT /api/v1/appointments/{id} endpoint implementation
- [ ] T051 DELETE /api/v1/appointments/{id} endpoint implementation
- [ ] T052 GET /api/v1/services endpoint implementation
- [ ] T053 GET /api/v1/services/{id} endpoint implementation
- [ ] T054 GET /api/v1/services/{id}/doctors endpoint implementation
- [ ] T055 GET /api/v1/doctors endpoint implementation
- [ ] T056 GET /api/v1/doctors/{id} endpoint implementation
- [ ] T057 GET /api/v1/doctors/{id}/schedule endpoint implementation
- [ ] T058 GET /api/v1/doctors/{id}/services endpoint implementation
- [ ] T059 POST /api/v1/contact endpoint implementation
- [ ] T060 GET /api/v1/contact/admin endpoint implementation
- [ ] T061 GET /api/v1/podcast endpoint implementation
- [ ] T062 GET /api/v1/podcast/{id} endpoint implementation
- [ ] T063 GET /api/v1/podcast/latest endpoint implementation
- [ ] T064 GET /api/v1/admin/stats endpoint implementation
- [ ] T065 GET /api/v1/admin/logs endpoint implementation

### Data Models and Services
- [ ] T066 [P] User authentication service in backend/src/services/auth.service.js
- [ ] T067 [P] Appointment management service in backend/src/services/appointment.service.js
- [ ] T068 [P] Service catalog service in backend/src/services/service.service.js
- [ ] T069 [P] Doctor profile service in backend/src/services/doctor.service.js
- [ ] T070 [P] Contact message service in backend/src/services/contact.service.js
- [ ] T071 [P] Podcast episode service in backend/src/services/podcast.service.js
- [ ] T072 [P] Database connection and query service in backend/src/services/database.service.js
- [ ] T073 [P] Event logging service in backend/src/services/logging.service.js

## Phase 3.4: Integration

### Nginx Configuration and SSL
- [ ] T074 Create Nginx main configuration in proxy/nginx.conf
- [ ] T075 [P] Configure SSL/TLS termination and HTTP/2 in proxy/ssl/ssl.conf
- [ ] T076 [P] Setup Let's Encrypt certificate management in proxy/ssl/renew-ssl.sh
- [ ] T077 [P] Configure reverse proxy routing for all services in proxy/routing.conf
- [ ] T078 Configure security headers and rate limiting in proxy/security.conf

### Service Communication and Middleware
- [ ] T079 [P] Create authentication middleware for API endpoints in backend/src/middleware/auth.js
- [ ] T080 [P] Create request/response logging middleware in backend/src/middleware/logging.js
- [ ] T081 [P] Create CORS and security headers middleware in backend/src/middleware/security.js
- [ ] T082 [P] Create rate limiting middleware in backend/src/middleware/rate-limit.js
- [ ] T083 [P] Create error handling middleware in backend/src/middleware/error-handler.js
- [ ] T084 [P] Configure WordPress REST API integration bridge in backend/src/services/wordpress-bridge.js

### Database Integration
- [ ] T085 [P] Create MySQL connection pool configuration in backend/src/config/database.js
- [ ] T086 [P] Implement WordPress database integration layer in backend/src/integrations/wordpress-db.js
- [ ] T087 [P] Create data migration scripts in scripts/migrate-data.sh
- [ ] T088 [P] Implement real-time data synchronization service in backend/src/services/sync.service.js
- [ ] T089 [P] Create database backup and recovery scripts in scripts/backup-db.sh

## Phase 3.5: Polish

### Testing and Quality Assurance
- [ ] T090 [P] Unit tests for all services in tests/unit/
- [ ] T091 [P] Integration tests for API endpoints in tests/integration/
- [ ] T092 [P] End-to-end tests for user workflows in tests/e2e/
- [ ] T093 Performance tests for all API endpoints (<200ms response)
- [ ] T094 Load testing for concurrent users (1000+ users)
- [ ] T095 Security testing and vulnerability scanning
- [ ] T096 [P] Container security scanning and hardening

### Monitoring and Documentation
- [ ] T097 [P] Setup application monitoring and alerting in monitoring/
- [ ] T098 [P] Create comprehensive deployment documentation in docs/deployment.md
- [ ] T099 [P] Create API documentation with examples in docs/api.md
- [ ] T100 [P] Create troubleshooting guide in docs/troubleshooting.md
- [ ] T101 Create maintenance procedures documentation in docs/maintenance.md
- [ ] T102 Create disaster recovery procedures in docs/disaster-recovery.md

### Optimization and Cleanup
- [ ] T103 [P] Optimize Docker image sizes and build times
- ] T104 [P] Implement caching strategies for static assets
- [ ] T105 [P] Optimize database queries and indexing
- [ ] T106 [P] Implement CDN integration for media files
- [ ] T107 [P] Setup automated backup and log rotation
- [ ] T108 Cleanup development artifacts and temporary files

## Dependencies
- Setup (T001-T006) before tests (T007-T027)
- Tests (T007-T027) before implementation (T028-T089)
- Docker containers (T028-T034) before WordPress setup (T035-T039)
- Database schema (T040-T044) before API implementation (T045-T065)
- Services (T066-T073) before integration (T074-T089)
- Integration before polish (T090-T108)

## Parallel Execution Groups

### Group 1: Initial Contract Tests (Can run in parallel)
```
Task: "Contract test POST /api/v1/auth/login in tests/contract/test_auth_login.js"
Task: "Contract test GET /api/v1/auth/profile in tests/contract/test_auth_profile.js"
Task: "Contract test POST /api/v1/appointments in tests/contract/test_appointments_post.js"
Task: "Contract test GET /api/v1/appointments in tests/contract/test_appointments_get.js"
Task: "Contract test PUT /api/v1/appointments/{id} in tests/contract/test_appointments_put.js"
```

### Group 2: Docker Container Creation (Can run in parallel)
```
Task: "Create frontend React/Vite Dockerfile in frontend/Dockerfile"
Task: "Create backend Node.js API Dockerfile in backend/Dockerfile"
Task: "Create WordPress PHP-FPM Dockerfile in wordpress/Dockerfile"
Task: "Create MySQL 8.0 Dockerfile in database/Dockerfile"
Task: "Create Nginx reverse proxy Dockerfile in proxy/Dockerfile"
```

### Group 3: WordPress Setup Tasks (Can run in parallel)
```
Task: "Setup WordPress custom post types in wordpress/wp-content/mu-plugins/custom-post-types.php"
Task: "Setup WordPress custom fields in wordpress/wp-content/plugins/clinic-fields/clinic-fields.php"
Task: "Configure WordPress REST API in wordpress/wp-content/mu-plugins/rest-api-config.php"
Task: "Create WordPress user roles in wordpress/wp-content/mu-plugins/user-roles.php"
Task: "Setup WordPress media library optimizations in wordpress/wp-content/mu-plugins/media-optimization.php"
```

### Group 4: Database Schema Creation (Can run in parallel)
```
Task: "Create MySQL schema for clinic appointments in database/init/01_clinic_appointments.sql"
Task: "Create MySQL schema for doctor schedules in database/init/02_doctor_schedules.sql"
Task: "Create MySQL schema for service mappings in database/init/03_service_mappings.sql"
Task: "Create event logging system schema in database/init/04_event_logging.sql"
```

### Group 5: Service Layer Implementation (Can run in parallel)
```
Task: "User authentication service in backend/src/services/auth.service.js"
Task: "Appointment management service in backend/src/services/appointment.service.js"
Task: "Service catalog service in backend/src/services/service.service.js"
Task: "Doctor profile service in backend/src/services/doctor.service.js"
Task: "Contact message service in backend/src/services/contact.service.js"
Task: "Podcast episode service in backend/src/services/podcast.service.js"
```

### Group 6: Integration Middleware (Can run in parallel)
```
Task: "Create authentication middleware in backend/src/middleware/auth.js"
Task: "Create request/response logging middleware in backend/src/middleware/logging.js"
Task: "Create CORS and security headers middleware in backend/src/middleware/security.js"
Task: "Create rate limiting middleware in backend/src/middleware/rate-limit.js"
Task: "Create error handling middleware in backend/src/middleware/error-handler.js"
```

## Critical Path Dependencies
- T007-T016 (contract tests) must fail before T045-T065 (implementation)
- T028-T034 (Docker containers) must complete before T035-T039 (WordPress setup)
- T040-T044 (database schema) must complete before T085-T089 (database integration)
- T066-T073 (services) must complete before T074-T084 (integration middleware)
- T089 (sync service) must complete before T090 (testing phase)

## Validation Checklist
- [ ] All 27 contract and integration tests created and failing
- [ ] All 5 major Docker containers defined with proper dependencies
- [ ] All WordPress custom post types and configurations implemented
- [ ] All database migration scripts created and tested
- [ ] All 18 API endpoints implemented with proper middleware
- [ ] All services follow proper dependency injection patterns
- [ ] Integration tests cover end-to-end user workflows
- [ ] Performance and security tests implemented
- [ ] Documentation is comprehensive and actionable
- [ ] Zero-downtime deployment process validated

## Notes
- [P] tasks can be executed in parallel using Task agent
- Verify all tests fail before implementing corresponding features
- Commit after each major task or group of related tasks
- Focus on container security and HIPAA-like compliance for medical data
- Ensure all WordPress integration maintains backward compatibility
- Monitor performance metrics throughout migration process
- Document all deviations from original specifications