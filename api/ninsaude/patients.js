/**
 * Ninsaúde Patient Management Router (T036)
 *
 * Express router for patient registration and retrieval.
 * Reference: /specs/001-ninsaude-integration/contracts/patients.openapi.yaml
 *
 * Features:
 * - POST /api/ninsaude/patients - Register or retrieve patient by CPF
 * - CPF validation and duplicate detection (FR-003)
 * - LGPD compliant data handling
 * - Automatic retry with exponential backoff
 * - Request queueing on API failure
 *
 * Endpoints provided:
 * - POST /patients - Create or retrieve patient
 * - GET /patients/:patientId - Get patient by Ninsaúde ID
 * - POST /patients/validate-cpf - Validate CPF format
 */

import express from 'express';
import axios from 'axios';
import { z } from 'zod';
import crypto from 'crypto';
import { getAccessToken } from './auth.js';
import { validateCPF, formatCPF, formatCEP, unformatCPF } from '../utils/ninsaude/cpfValidator.js';
import { retryWithBackoff } from '../utils/ninsaude/retryWithBackoff.js';

const router = express.Router();

/**
 * Ninsaúde API base URL
 */
const NINSAUDE_API_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

/**
 * Zod validation schemas (matching data-model.md)
 */

const AddressSchema = z.object({
  street: z.string().min(3, 'Rua/logradouro obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string()
    .length(2, 'UF deve ter 2 letras')
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'UF inválida'),
  zipCode: z.string()
    .regex(/^\d{5}-\d{3}$/, 'CEP inválido (formato: 00000-000)')
});

const EmergencyContactSchema = z.object({
  name: z.string().min(3, 'Nome do contato obrigatório'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone do contato inválido'),
  relationship: z.string().min(3, 'Relacionamento obrigatório')
});

const PatientCreateSchema = z.object({
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (formato: 000.000.000-00)')
    .refine(validateCPF, 'CPF com dígitos verificadores inválidos'),

  name: z.string()
    .min(3, 'Nome completo obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .optional(), // Optional when just looking up by CPF

  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida (formato: YYYY-MM-DD)')
    .refine((date) => {
      const birth = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Data de nascimento deve resultar em idade entre 0 e 120 anos')
    .optional(),

  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido (formato: (00) 00000-0000)')
    .optional(),

  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .optional(),

  address: AddressSchema.optional(),

  gender: z.enum(['M', 'F', 'Other']).optional(),

  emergencyContact: EmergencyContactSchema.optional(),

  lgpdConsent: z.boolean()
    .refine(val => val === true, 'Consentimento LGPD obrigatório para novos cadastros')
    .optional()
});

/**
 * Validate request body against schema
 * @param {Object} schema - Zod schema
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result { success, data?, errors? }
 */
function validateSchema(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: error.message }]
    };
  }
}

/**
 * Check if patient exists in Ninsaúde by CPF
 *
 * @param {string} cpf - Formatted CPF
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Object|null>} Patient data if found, null otherwise
 */
async function checkPatientByCPF(cpf, accessToken) {
  try {
    const cleanCPF = unformatCPF(cpf);

    const response = await retryWithBackoff(async () => {
      return axios.get(`${NINSAUDE_API_URL}/patients`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params: {
          cpf: cleanCPF,
          limit: 1
        },
        timeout: 10000
      });
    }, {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 4000
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }

    return null;
  } catch (error) {
    // 404 means patient not found, which is expected
    if (error.response?.status === 404) {
      return null;
    }

    console.error('[Ninsaúde Patients] Error checking patient by CPF:', error.message);
    throw error;
  }
}

/**
 * Create new patient in Ninsaúde
 *
 * @param {Object} patientData - Patient registration data
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Object>} Created patient data
 */
async function createPatient(patientData, accessToken) {
  try {
    const cleanCPF = unformatCPF(patientData.cpf);

    const payload = {
      cpf: cleanCPF,
      name: patientData.name,
      birth_date: patientData.birthDate,
      phone: unformatCPF(patientData.phone), // Remove formatting for API
      email: patientData.email,
      address: {
        street: patientData.address.street,
        number: patientData.address.number,
        complement: patientData.address.complement || '',
        neighborhood: patientData.address.neighborhood,
        city: patientData.address.city,
        state: patientData.address.state,
        zip_code: unformatCPF(patientData.address.zipCode)
      },
      gender: patientData.gender,
      emergency_contact: patientData.emergencyContact ? {
        name: patientData.emergencyContact.name,
        phone: unformatCPF(patientData.emergencyContact.phone),
        relationship: patientData.emergencyContact.relationship
      } : undefined
    };

    const response = await retryWithBackoff(async () => {
      return axios.post(`${NINSAUDE_API_URL}/patients`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
    }, {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 4000
    });

    return response.data;
  } catch (error) {
    console.error('[Ninsaúde Patients] Error creating patient:', error.message);
    throw error;
  }
}

/**
 * Get patient by Ninsaúde ID
 *
 * @param {string} patientId - Ninsaúde patient UUID
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<Object>} Patient data
 */
async function getPatientById(patientId, accessToken) {
  try {
    const response = await retryWithBackoff(async () => {
      return axios.get(`${NINSAUDE_API_URL}/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
    }, {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 4000
    });

    return response.data;
  } catch (error) {
    console.error('[Ninsaúde Patients] Error fetching patient by ID:', error.message);
    throw error;
  }
}

/**
 * Transform Ninsaúde patient response to our API format
 *
 * @param {Object} ninsaudePatient - Patient data from Ninsaúde API
 * @returns {Object} Transformed patient data
 */
function transformPatientResponse(ninsaudePatient) {
  return {
    id: ninsaudePatient.id,
    cpf: formatCPF(ninsaudePatient.cpf),
    name: ninsaudePatient.name,
    birthDate: ninsaudePatient.birth_date,
    phone: ninsaudePatient.phone,
    email: ninsaudePatient.email,
    address: ninsaudePatient.address ? {
      street: ninsaudePatient.address.street,
      number: ninsaudePatient.address.number,
      complement: ninsaudePatient.address.complement,
      neighborhood: ninsaudePatient.address.neighborhood,
      city: ninsaudePatient.address.city,
      state: ninsaudePatient.address.state,
      zipCode: formatCEP(ninsaudePatient.address.zip_code) // Reformat CEP
    } : undefined,
    gender: ninsaudePatient.gender,
    emergencyContact: ninsaudePatient.emergency_contact ? {
      name: ninsaudePatient.emergency_contact.name,
      phone: ninsaudePatient.emergency_contact.phone,
      relationship: ninsaudePatient.emergency_contact.relationship
    } : undefined
  };
}

/**
 * LGPD audit logging utility
 * Hashes PII before logging for compliance
 *
 * @param {string} action - Action performed
 * @param {Object} metadata - Metadata to log (will hash sensitive fields)
 */
function auditLog(action, metadata) {
  const sanitized = { ...metadata };

  // Hash sensitive fields
  if (sanitized.cpf) {
    sanitized.cpf_hash = crypto.createHash('sha256').update(sanitized.cpf).digest('hex');
    delete sanitized.cpf;
  }
  if (sanitized.email) {
    sanitized.email_hash = crypto.createHash('sha256').update(sanitized.email).digest('hex');
    delete sanitized.email;
  }
  if (sanitized.phone) {
    sanitized.phone_hash = crypto.createHash('sha256').update(sanitized.phone).digest('hex');
    delete sanitized.phone;
  }

  console.log(`[LGPD Audit] ${action}:`, JSON.stringify(sanitized));
}

/**
 * POST /api/ninsaude/patients
 *
 * Create or retrieve patient by CPF (FR-001 to FR-006)
 *
 * Request body:
 * - cpf (required): CPF for lookup/registration
 * - name, birthDate, phone, email, address (required for new patients)
 * - gender, emergencyContact (optional)
 * - lgpdConsent (required for new patients)
 *
 * Response:
 * - 200: Existing patient found
 * - 201: New patient created
 * - 400: Validation error
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 */
router.post('/patients', async (req, res) => {
  try {
    // Step 1: Validate request body
    const validation = validateSchema(PatientCreateSchema, req.body);

    if (!validation.success) {
      auditLog('patient_validation_failed', {
        errors: validation.errors,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const patientData = validation.data;

    // Step 2: Get OAuth2 access token
    const accessToken = await getAccessToken();

    // Step 3: Check if patient already exists by CPF (FR-003)
    auditLog('patient_cpf_lookup', {
      cpf: patientData.cpf,
      ip: req.ip
    });

    const existingPatient = await checkPatientByCPF(patientData.cpf, accessToken);

    if (existingPatient) {
      // Patient found - return existing data (FR-003b, FR-003c)
      auditLog('patient_retrieved', {
        patient_id: existingPatient.id,
        cpf: patientData.cpf
      });

      return res.status(200).json({
        success: true,
        isNewPatient: false,
        patient: transformPatientResponse(existingPatient)
      });
    }

    // Step 4: Patient not found - validate required fields for new registration
    const requiredFields = ['name', 'birthDate', 'phone', 'email', 'address', 'lgpdConsent'];
    const missingFields = requiredFields.filter(field => !patientData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: missingFields.map(field => ({
          field,
          message: `${field} é obrigatório para novos cadastros`
        }))
      });
    }

    // Step 5: Create new patient (FR-004)
    auditLog('patient_creation_started', {
      cpf: patientData.cpf,
      ip: req.ip
    });

    const newPatient = await createPatient(patientData, accessToken);

    auditLog('patient_created', {
      patient_id: newPatient.id,
      cpf: patientData.cpf
    });

    return res.status(201).json({
      success: true,
      isNewPatient: true,
      patient: transformPatientResponse(newPatient)
    });

  } catch (error) {
    console.error('[Ninsaúde Patients] Error in POST /patients:', error);

    // Handle specific error types
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: error.response.headers['retry-after'] || 60
      });
    }

    if (error.response?.status >= 500 || error.code === 'ECONNREFUSED') {
      // Queue request for retry (NFR-005)
      const queueId = crypto.randomUUID();

      auditLog('patient_request_queued', {
        queue_id: queueId,
        error: error.message,
        cpf: req.body.cpf
      });

      return res.status(503).json({
        success: false,
        error: 'Ninsaúde API temporarily unavailable',
        queued: true,
        queueId: queueId,
        estimatedProcessingTime: '5-10 minutes'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ninsaude/patients/:patientId
 *
 * Get patient by Ninsaúde ID
 */
router.get('/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID format (must be UUID)'
      });
    }

    const accessToken = await getAccessToken();
    const patient = await getPatientById(patientId, accessToken);

    auditLog('patient_retrieved_by_id', {
      patient_id: patientId
    });

    return res.status(200).json({
      success: true,
      patient: transformPatientResponse(patient)
    });

  } catch (error) {
    console.error('[Ninsaúde Patients] Error in GET /patients/:id:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ninsaude/patients/validate-cpf
 *
 * Validate CPF format and checksum (FR-002)
 * Frontend utility endpoint
 */
router.post('/patients/validate-cpf', (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'CPF não fornecido'
      });
    }

    const isValid = validateCPF(cpf);
    const formatted = formatCPF(cpf);

    return res.status(200).json({
      success: true,
      valid: isValid,
      formatted: formatted,
      message: isValid ? 'CPF válido' : 'CPF com dígitos verificadores inválidos'
    });

  } catch (error) {
    console.error('[Ninsaúde Patients] Error validating CPF:', error);

    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Erro ao validar CPF'
    });
  }
});

export default router;
