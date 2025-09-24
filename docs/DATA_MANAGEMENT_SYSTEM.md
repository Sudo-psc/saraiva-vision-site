# Data Management System

## Overview

The Data Management System provides comprehensive automated data retention, anonymization, and user data portability features to ensure LGPD (Lei Geral de Proteção de Dados) compliance for the AI chatbot widget. This system handles the complete lifecycle of personal data from collection to deletion, with robust privacy protection mechanisms.

## Features

### 1. Automated Data Retention and Deletion

The system automatically manages data lifecycle according to LGPD requirements:

- **Scheduled Retention**: Automatically schedules data for deletion based on retention policies
- **Batch Processing**: Processes data in configurable batches to maintain system performance
- **Dry Run Mode**: Allows testing retention policies without actual data deletion
- **Grace Periods**: Provides grace periods for sensitive data requiring manual review

#### Retention Policies

| Data Type | Retention Period | Auto Delete | Legal Basis |
|-----------|------------------|-------------|-------------|
| Conversation Data | 365 days | Yes | Legitimate Interest |
| Medical Data | 1825 days (5 years) | No | Vital Interest |
| Consent Records | 2555 days (7 years) | No | Legal Obligation |
| Audit Logs | 1095 days (3 years) | Yes | Legal Obligation |
| Appointment Data | 1095 days (3 years) | No | Contract |
| Marketing Data | 730 days (2 years) | Yes | Consent |

### 2. Data Anonymization and Pseudonymization

Advanced anonymization techniques to protect user privacy:

#### Anonymization Techniques

- **Suppression**: Complete removal of sensitive data
- **Generalization**: Replacing specific values with broader categories
- **Perturbation**: Adding statistical noise to numerical data
- **Substitution**: Replacing real values with realistic alternatives
- **Hashing**: One-way cryptographic hashing
- **Tokenization**: Replacing sensitive data with non-sensitive tokens
- **Masking**: Partial concealment of data

#### Anonymization Levels

- **MINIMAL**: Only critical sensitivity data (CRITICAL level)
- **STANDARD**: High and critical sensitivity data (default)
- **AGGRESSIVE**: Medium, high, and critical sensitivity data

#### Data Categories and Sensitivity

| Category | Fields | Sensitivity | Default Technique |
|----------|--------|-------------|-------------------|
| Personal Identifiers | name, cpf, rg, passport | CRITICAL | Tokenization |
| Contact Info | email, phone, address | HIGH | Hashing |
| Medical Data | symptoms, diagnosis, medications | CRITICAL | Substitution |
| Behavioral Data | conversation_history, preferences | MEDIUM | Generalization |
| Technical Data | ip_address, user_agent, session_id | MEDIUM | Hashing |

### 3. User Data Portability

Complete data export functionality for LGPD compliance:

#### Export Formats

- **JSON**: Structured data format (default)
- **CSV**: Comma-separated values for spreadsheet applications
- **XML**: Extensible markup language format
- **PDF**: Human-readable document format

#### Export Options

- **Data Types**: Select specific data categories or all data
- **Metadata Inclusion**: Include export metadata and compliance information
- **Anonymization**: Option to anonymize exported data
- **Compression**: Configurable compression levels

### 4. Privacy-Preserving Analytics

Advanced privacy techniques for data analysis:

#### K-Anonymity

Ensures each record is indistinguishable from at least k-1 other records:

- Configurable k-value (default: k=3)
- Quasi-identifier specification
- Information loss calculation
- Data utility metrics

#### Differential Privacy

Adds calibrated noise to protect individual privacy:

- **Laplace Mechanism**: For numerical queries
- **Gaussian Mechanism**: For more complex statistical queries
- Configurable privacy budget (epsilon)
- Utility preservation metrics

## API Reference

### Base URL

```
/api/data-management
```

### Authentication

All administrative operations require admin authentication:

```http
X-Admin-Key: your-admin-api-key
```

### Endpoints

#### 1. Run Automated Data Retention

```http
POST /api/data-management?action=run-retention
```

**Request Body:**
```json
{
  "dryRun": false,
  "dataTypes": ["ALL"],
  "batchSize": 100,
  "maxProcessingTime": 1800000
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "processed": 150,
    "anonymized": 75,
    "deleted": 75,
    "errors": [],
    "summary": {
      "totalProcessed": 150,
      "successRate": 100
    }
  },
  "dryRun": false,
  "processingTime": 45000
}
```

#### 2. Run Automated Anonymization

```http
POST /api/data-management?action=run-anonymization
```

**Request Body:**
```json
{
  "dataTypes": ["CONVERSATION_DATA", "SESSION_DATA"],
  "retentionThreshold": 365,
  "batchSize": 50
}
```

#### 3. Export User Data

```http
POST /api/data-management?action=export-user-data
```

**Request Body:**
```json
{
  "sessionId": "session_123",
  "format": "JSON",
  "dataTypes": ["CONVERSATIONS", "CONSENTS"],
  "includeMetadata": true,
  "anonymizeExport": false
}
```

**Response:**
```json
{
  "success": true,
  "exportId": "export_1234567890_abc123",
  "status": "PROCESSING",
  "estimatedCompletion": "2024-01-15T14:30:00Z",
  "format": "JSON",
  "dataTypes": ["CONVERSATIONS", "CONSENTS"]
}
```

#### 4. Get Export Status

```http
GET /api/data-management?action=get-export-status&exportId=export_123
```

#### 5. Anonymize Data

```http
POST /api/data-management?action=anonymize-data
```

**Request Body:**
```json
{
  "data": {
    "name": "João Silva",
    "email": "joao@example.com",
    "age": 35
  },
  "anonymizationLevel": "STANDARD",
  "preserveStructure": true,
  "retainStatisticalProperties": false
}
```

#### 6. Pseudonymize Data

```http
POST /api/data-management?action=pseudonymize-data
```

**Request Body:**
```json
{
  "data": {
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "preserveFormat": true,
  "deterministicMapping": true
}
```

#### 7. User Rights Request

```http
POST /api/data-management?action=user-rights-request
```

**Request Body:**
```json
{
  "sessionId": "session_123",
  "rightType": "deletion",
  "requestData": {
    "reason": "User requested data deletion",
    "immediateDelete": false
  }
}
```

#### 8. Get Statistics

```http
GET /api/data-management?action=get-statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "retention": {
      "lastRun": "2024-01-15T10:00:00Z",
      "processedItems": 1250,
      "isRunning": false,
      "scheduledItems": 50,
      "overdueItems": 5
    },
    "anonymization": {
      "lastRun": "2024-01-15T09:00:00Z",
      "processedItems": 800,
      "isRunning": false,
      "anonymizedRecords": 15000
    },
    "exports": {
      "activeExports": 3,
      "completedToday": 12,
      "totalExports": 1500
    },
    "compliance": {
      "dataRetentionCompliance": 95.5,
      "anonymizationCompliance": 98.2,
      "userRightsFulfillment": 99.1
    }
  }
}
```

## Usage Examples

### JavaScript/Node.js

```javascript
import DataManagementService from './src/services/dataManagementService.js';

const dataManager = new DataManagementService();

// Run automated data retention
const retentionResult = await dataManager.runAutomatedDataRetention({
  dryRun: false,
  dataTypes: ['CONVERSATION_DATA'],
  batchSize: 100
});

// Export user data
const exportResult = await dataManager.exportUserData('session_123', {
  format: 'JSON',
  dataTypes: ['ALL'],
  includeMetadata: true
});

// Anonymize sensitive data
const anonymizationResult = await dataManager.anonymizeData({
  name: 'João Silva',
  email: 'joao@example.com'
}, 'PERSONAL_DATA');
```

### React Component

```jsx
import React, { useState } from 'react';

function DataExportComponent({ sessionId }) {
  const [exportStatus, setExportStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestDataExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-management?action=export-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          format: 'JSON',
          dataTypes: ['ALL'],
          includeMetadata: true
        })
      });

      const result = await response.json();
      setExportStatus(result);
    } catch (error) {
      console.error('Export request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={requestDataExport} disabled={loading}>
        {loading ? 'Requesting Export...' : 'Export My Data'}
      </button>
      
      {exportStatus && (
        <div>
          <p>Export Status: {exportStatus.status}</p>
          <p>Export ID: {exportStatus.exportId}</p>
          {exportStatus.estimatedCompletion && (
            <p>Estimated Completion: {new Date(exportStatus.estimatedCompletion).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Data Management Configuration
DATA_RETENTION_ENABLED=true
ANONYMIZATION_ENABLED=true
EXPORT_ENABLED=true

# Retention Periods (in days)
CONVERSATION_DATA_RETENTION=365
MEDICAL_DATA_RETENTION=1825
CONSENT_RECORDS_RETENTION=2555
AUDIT_LOGS_RETENTION=1095

# Processing Configuration
RETENTION_BATCH_SIZE=100
ANONYMIZATION_BATCH_SIZE=50
MAX_PROCESSING_TIME=1800000

# Export Configuration
EXPORT_STORAGE_PATH=/exports
EXPORT_EXPIRY_DAYS=7
MAX_EXPORT_SIZE=100MB

# Admin API Key
ADMIN_API_KEY=your-secure-admin-key
```

### Database Configuration

The system requires the following database tables (automatically created by migrations):

- `chatbot_conversations` - Conversation data with retention metadata
- `user_consents` - LGPD consent management
- `medical_referrals` - Medical referral tracking
- `chatbot_sessions` - Session management
- `chatbot_audit_logs` - Comprehensive audit trail
- `chatbot_metrics` - Performance and compliance metrics

## Monitoring and Compliance

### Audit Logging

All data management operations are logged for compliance:

- Data retention executions
- Anonymization operations
- User data exports
- User rights requests
- System configuration changes

### Compliance Metrics

The system tracks key compliance indicators:

- **Data Retention Compliance**: Percentage of data processed within retention periods
- **Anonymization Compliance**: Percentage of data properly anonymized
- **User Rights Fulfillment**: Percentage of user rights requests fulfilled on time

### Alerts and Notifications

- Overdue data retention items
- Failed anonymization operations
- Export processing errors
- Compliance threshold breaches

## Security Considerations

### Data Protection

- End-to-end encryption for sensitive data
- Secure key management with automatic rotation
- Access controls with role-based permissions
- Audit trails for all data access

### Privacy by Design

- Data minimization principles
- Purpose limitation enforcement
- Storage limitation with automatic deletion
- Transparency through clear privacy notices

### Technical Safeguards

- Input validation and sanitization
- Rate limiting for API endpoints
- Secure file storage for exports
- Regular security assessments

## Troubleshooting

### Common Issues

1. **Retention Processing Stuck**
   - Check system resources and database connections
   - Review batch size configuration
   - Examine error logs for specific failures

2. **Export Generation Fails**
   - Verify storage permissions and disk space
   - Check data format compatibility
   - Review session data availability

3. **Anonymization Errors**
   - Validate data structure and types
   - Check anonymization rules configuration
   - Review sensitivity level mappings

### Performance Optimization

- Adjust batch sizes based on system capacity
- Schedule retention operations during low-traffic periods
- Use database indexing for large datasets
- Monitor memory usage during processing

## Legal Compliance

This system is designed to comply with:

- **LGPD** (Lei Geral de Proteção de Dados) - Brazilian data protection law
- **CFM** (Conselho Federal de Medicina) - Medical ethics regulations
- **ISO 27001** - Information security management
- **GDPR** principles - European data protection standards

For specific legal requirements, consult with your data protection officer and legal team.

## Support

For technical support or questions about the data management system:

- Email: dpo@saraivavisao.com.br
- Documentation: [Internal Wiki]
- Issue Tracking: [GitHub Issues]
- Emergency Contact: +55 11 1234-5678