# Quickstart Guide: Medical Appointment Scheduling API

**Project**: `001-medical-appointment-api` | **Technology**: FastAPI + SQLite
**Branch**: `001-medical-appointment-api` | **Phase**: Implementation Ready

## Quick Setup (Local Development)

### Prerequisites
- Python 3.11+ installed
- SQLite3 (usually included with Python)
- Git for version control

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd medical-appointment-api

# Switch to feature branch
git checkout 001-medical-appointment-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Initialization
```bash
# Create database and run migrations
python -m alembic upgrade head

# Or use the simple setup script
python scripts/setup_database.py
```

### 3. Run Development Server
```bash
# Start FastAPI development server
uvicorn main:app --reload --port 8000

# Or use the development script
python scripts/dev_server.py
```

### 4. Verify Installation
```bash
# Check API health
curl http://localhost:8000/health

# Open API documentation
open http://localhost:8000/docs
```

## Core API Usage Examples

### Patient Management
```bash
# Create a new patient
curl -X POST "http://localhost:8000/api/v1/patients" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "João Silva",
    "email": "joao.silva@email.com",
    "phone": "+55 11 99999-8888",
    "date_of_birth": "1980-01-15",
    "gender": "Male"
  }'

# List patients with pagination
curl "http://localhost:8000/api/v1/patients?page=1&limit=10"

# Get specific patient
curl "http://localhost:8000/api/v1/patients/1"
```

### Appointment Scheduling
```bash
# Create an appointment
curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "service_id": 1,
    "appointment_datetime": "2024-01-15T10:00:00",
    "notes": "Annual eye examination"
  }'

# Check availability for a date
curl "http://localhost:8000/api/v1/appointments/availability?date=2024-01-15"

# List appointments
curl "http://localhost:8000/api/v1/appointments?status=scheduled"
```

### Service Management
```bash
# Create a medical service
curl -X POST "http://localhost:8000/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete Eye Examination",
    "description": "Comprehensive eye health checkup",
    "duration_minutes": 60,
    "price": 150.00,
    "requires_doctor": true
  }'

# List available services
curl "http://localhost:8000/api/v1/services?is_active=true"
```

## Development Workflow

### 1. Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
```

### 2. Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### 3. Code Quality
```bash
# Format code
black src/
isort src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

## Project Structure

```
medical_appointment_api/
├── src/
│   ├── models/          # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── api/           # FastAPI endpoints
│   └── database/      # Database configuration
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── contract/      # Contract tests
├── alembic/          # Database migrations
├── scripts/          # Utility scripts
├── main.py          # FastAPI application entry
└── requirements.txt # Python dependencies
```

## Key Features Ready for Implementation

### ✅ Patient Management
- Complete CRUD operations with validation
- Email uniqueness checking
- Soft delete functionality
- Pagination and search capabilities

### ✅ Appointment Scheduling
- Time slot availability checking
- Conflict prevention
- Status lifecycle management
- Reminder system integration

### ✅ Service Management
- Medical service catalog
- Duration and pricing configuration
- Doctor assignment requirements
- Active/inactive status management

### ✅ Data Security & Compliance
- PII detection and protection
- Audit logging for all operations
- Data retention policies
- Input validation and sanitization

## Configuration

### Environment Variables
Create a `.env` file:
```env
# Database
DATABASE_URL=sqlite:///./medical_appointment.db

# API Settings
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Development
DEBUG=true
ENVIRONMENT=development
```

### Production Setup
```env
# Production configuration
DEBUG=false
ENVIRONMENT=production
DATABASE_URL=sqlite:///./medical_appointment_prod.db
SECRET_KEY=production-secret-key
```

## Testing the Implementation

### Contract Testing
The API contracts in `/specs/001-medical-appointment-api/contracts/` define the exact interface. Use these to validate implementation:

```bash
# Validate patient API contract
curl -f http://localhost:8000/api/v1/patients/1 || echo "Contract violation"

# Test appointment creation follows contract
curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' \
  && echo "Should fail with 400"
```

### Integration Testing
```bash
# Test complete appointment flow
python tests/integration/test_appointment_flow.py

# Test data integrity
python tests/integration/test_data_validation.py
```

## Deployment Preparation

### 1. Build for Production
```bash
# Install production dependencies
pip install -r requirements-prod.txt

# Run database migrations
alembic upgrade head

# Validate setup
python scripts/validate_production.py
```

### 2. Performance Testing
```bash
# Run load tests
locust -f tests/load_test.py

# Check response times
python tests/performance_test.py
```

## Next Steps

With this quickstart guide, you can:

1. **Setup Development Environment**: Follow the quick setup steps
2. **Implement API Endpoints**: Use the contracts in `/contracts/` as specification
3. **Run Tests**: Validate against contract tests
4. **Deploy to Production**: Follow production setup guidelines

The complete API specification is available in:
- `/specs/001-medical-appointment-api/contracts/` - API contracts
- `/specs/001-medical-appointment-api/data-model.md` - Database schema
- `/specs/001-medical-appointment-api/plan.md` - Implementation plan

## Support

For issues or questions:
- Check API documentation at `/docs` when server is running
- Review test files for usage examples
- Consult the data model for database relationships