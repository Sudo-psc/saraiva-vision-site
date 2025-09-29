# Saraiva Vision Constitution

## Project Principles

1. **Medical Compliance First**: All features must comply with CFM (Brazilian Medical Council) regulations and LGPD data protection laws.

2. **Patient Privacy**: Protect patient data above all else. Implement proper encryption, access controls, and audit logging.

3. **Performance**: Medical websites must load quickly and be accessible to all users, including those with limited connectivity.

4. **Accessibility**: Ensure WCAG 2.1 AA compliance for all medical content and functionality.

5. **Security**: Implement industry-standard security practices, especially for medical data handling.

## Technical Standards

1. **Code Quality**: Maintain 80%+ test coverage, use TypeScript for type safety, follow ESLint rules.

2. **Architecture**: Prefer modular, decoupled components. Use dependency injection and clear interfaces.

3. **API Design**: RESTful APIs with proper error handling, rate limiting, and documentation.

4. **Database**: Use proper indexing, constraints, and follow normalization principles.

5. **Frontend**: React with TypeScript, Tailwind CSS, and modern build tools (Vite).

## WordPress Integration Requirements

1. **Headless Architecture**: WordPress serves content via REST API, not direct rendering.

2. **External Server Support**: Must support WordPress instances hosted on different servers/domains.

3. **Caching Strategy**: Implement proper caching for external API responses to ensure performance.

4. **Security**: Validate all external content, sanitize inputs, and implement proper CORS policies.

5. **Fallback Systems**: Graceful degradation when external WordPress service is unavailable.

## Integration Patterns

1. **API Proxy**: Use proxy endpoints to avoid CORS issues and provide additional security.

2. **Content Synchronization**: Implement sync mechanisms for content that needs to be cached locally.

3. **Error Handling**: Robust error handling for network failures, API changes, and content validation.

4. **Monitoring**: Monitor external service health and performance metrics.

## Compliance Requirements

1. **Medical Content**: All medical content must include proper disclaimers and CFM compliance information.

2. **Data Handling**: Patient data must be handled according to LGPD regulations.

3. **Audit Logging**: Log all access to medical content and patient interactions.

4. **Consent Management**: Implement proper consent management for data processing.