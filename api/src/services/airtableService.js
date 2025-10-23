/**
 * Airtable Service
 *
 * Backend service for managing subscriber data in Airtable.
 * Provides CRUD operations for Subscribers, Appointments, and Activity Log.
 *
 * SECURITY: This service should ONLY be used in the backend.
 * Never expose Airtable API keys to the frontend.
 *
 * @module airtableService
 */

import Airtable from 'airtable';
import crypto from 'crypto';

/**
 * Initialize Airtable with API key
 */
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY environment variable is required');
}

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID || '');

/**
 * Table names from environment variables
 */
const TABLES = {
  SUBSCRIBERS: process.env.AIRTABLE_SUBSCRIBERS_TABLE || 'Subscribers',
  APPOINTMENTS: process.env.AIRTABLE_APPOINTMENTS_TABLE || 'Appointments',
  ACTIVITY_LOG: process.env.AIRTABLE_ACTIVITY_LOG_TABLE || 'Activity_Log',
};

/**
 * Encryption key for sensitive data (CPF, medical history)
 * In production, use a proper key management service
 */
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text with IV and auth tag
 */
function encrypt(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY not set, storing data unencrypted');
    return text;
  }

  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV and auth tag
 * @returns {string} Decrypted text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  if (!ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY not set, returning data as-is');
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      return encryptedText; // Not encrypted format
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Get subscriber by Firebase UID
 * @param {string} firebaseUid - Firebase user UID
 * @returns {Promise<Object | null>} Subscriber record or null if not found
 */
export async function getSubscriberByFirebaseUid(firebaseUid) {
  try {
    const records = await base(TABLES.SUBSCRIBERS)
      .select({
        filterByFormula: `{firebase_uid} = '${firebaseUid}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return null;
    }

    return formatSubscriberRecord(records[0]);
  } catch (error) {
    console.error('Error getting subscriber by Firebase UID:', error);
    throw new Error('Failed to retrieve subscriber data');
  }
}

/**
 * Get subscriber by Airtable record ID
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<Object>} Subscriber record
 */
export async function getSubscriberById(recordId) {
  try {
    const record = await base(TABLES.SUBSCRIBERS).find(recordId);
    return formatSubscriberRecord(record);
  } catch (error) {
    console.error('Error getting subscriber by ID:', error);
    throw new Error('Failed to retrieve subscriber data');
  }
}

/**
 * Create new subscriber
 * @param {Object} subscriberData - Subscriber data from Firebase Auth
 * @param {string} subscriberData.firebaseUid - Firebase UID
 * @param {string} subscriberData.email - Email
 * @param {string} subscriberData.displayName - Display name
 * @param {string} subscriberData.photoURL - Photo URL
 * @param {Object} additionalData - Additional subscriber data
 * @returns {Promise<Object>} Created subscriber record
 */
export async function createSubscriber(subscriberData, additionalData = {}) {
  try {
    const fields = {
      firebase_uid: subscriberData.firebaseUid || subscriberData.uid,
      email: subscriberData.email,
      display_name: subscriberData.displayName || '',
      photo_url: subscriberData.photoURL || '',
      subscription_status: additionalData.subscription_status || 'inactive',
      subscription_plan: additionalData.subscription_plan || 'basico',
      subscription_start: additionalData.subscription_start || new Date().toISOString().split('T')[0],
      phone: additionalData.phone || '',
      cpf: additionalData.cpf ? encrypt(additionalData.cpf) : '',
      birth_date: additionalData.birth_date || '',
      address: additionalData.address || '',
      medical_history: additionalData.medical_history ? encrypt(additionalData.medical_history) : '',
      notes: additionalData.notes || '',
    };

    // Add subscription_end if provided
    if (additionalData.subscription_end) {
      fields.subscription_end = additionalData.subscription_end;
    }

    const record = await base(TABLES.SUBSCRIBERS).create([{ fields }]);
    return formatSubscriberRecord(record[0]);
  } catch (error) {
    console.error('Error creating subscriber:', error);
    throw new Error('Failed to create subscriber');
  }
}

/**
 * Update subscriber
 * @param {string} recordId - Airtable record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated subscriber record
 */
export async function updateSubscriber(recordId, updates) {
  try {
    const fields = { ...updates };

    // Encrypt sensitive fields if present
    if (fields.cpf) {
      fields.cpf = encrypt(fields.cpf);
    }
    if (fields.medical_history) {
      fields.medical_history = encrypt(fields.medical_history);
    }

    const record = await base(TABLES.SUBSCRIBERS).update([
      {
        id: recordId,
        fields,
      },
    ]);

    return formatSubscriberRecord(record[0]);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    throw new Error('Failed to update subscriber');
  }
}

/**
 * Delete subscriber (soft delete by setting status to inactive)
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<void>}
 */
export async function deleteSubscriber(recordId) {
  try {
    await updateSubscriber(recordId, {
      subscription_status: 'inactive',
      notes: `Account deleted on ${new Date().toISOString()}`,
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    throw new Error('Failed to delete subscriber');
  }
}

/**
 * Get appointments for subscriber
 * @param {string} subscriberId - Subscriber record ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of records
 * @param {string} options.status - Filter by status
 * @returns {Promise<Array>} List of appointments
 */
export async function getSubscriberAppointments(subscriberId, options = {}) {
  try {
    const { limit = 100, status } = options;

    let filterFormula = `{subscriber_id} = '${subscriberId}'`;
    if (status) {
      filterFormula = `AND(${filterFormula}, {status} = '${status}')`;
    }

    const records = await base(TABLES.APPOINTMENTS)
      .select({
        filterByFormula: filterFormula,
        maxRecords: limit,
        sort: [{ field: 'appointment_date', direction: 'desc' }],
      })
      .firstPage();

    return records.map(formatAppointmentRecord);
  } catch (error) {
    console.error('Error getting subscriber appointments:', error);
    throw new Error('Failed to retrieve appointments');
  }
}

/**
 * Create appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment record
 */
export async function createAppointment(appointmentData) {
  try {
    const fields = {
      subscriber_id: [appointmentData.subscriber_id], // Array for linked record
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      status: appointmentData.status || 'scheduled',
      service_type: appointmentData.service_type,
      doctor_name: appointmentData.doctor_name || 'Dr. Philipe Saraiva',
      notes: appointmentData.notes || '',
    };

    const record = await base(TABLES.APPOINTMENTS).create([{ fields }]);
    return formatAppointmentRecord(record[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
}

/**
 * Update appointment
 * @param {string} recordId - Appointment record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated appointment record
 */
export async function updateAppointment(recordId, updates) {
  try {
    const record = await base(TABLES.APPOINTMENTS).update([
      {
        id: recordId,
        fields: updates,
      },
    ]);

    return formatAppointmentRecord(record[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}

/**
 * Log activity
 * @param {string} subscriberId - Subscriber record ID
 * @param {string} action - Action type (login, logout, update_profile, etc.)
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Created activity log record
 */
export async function logActivity(subscriberId, action, details = {}) {
  try {
    const fields = {
      subscriber_id: [subscriberId], // Array for linked record
      action,
      ip_address: details.ip_address || '',
      user_agent: details.user_agent || '',
      details: JSON.stringify(details),
    };

    const record = await base(TABLES.ACTIVITY_LOG).create([{ fields }]);
    return formatActivityLogRecord(record[0]);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error for activity logging to avoid blocking main operations
    return null;
  }
}

/**
 * Get activity log for subscriber
 * @param {string} subscriberId - Subscriber record ID
 * @param {number} limit - Maximum number of records
 * @returns {Promise<Array>} List of activity log records
 */
export async function getSubscriberActivityLog(subscriberId, limit = 50) {
  try {
    const records = await base(TABLES.ACTIVITY_LOG)
      .select({
        filterByFormula: `{subscriber_id} = '${subscriberId}'`,
        maxRecords: limit,
        sort: [{ field: 'timestamp', direction: 'desc' }],
      })
      .firstPage();

    return records.map(formatActivityLogRecord);
  } catch (error) {
    console.error('Error getting activity log:', error);
    throw new Error('Failed to retrieve activity log');
  }
}

/**
 * Format subscriber record
 * @param {Object} record - Airtable record
 * @returns {Object} Formatted subscriber object
 */
function formatSubscriberRecord(record) {
  const fields = record.fields;

  return {
    id: record.id,
    firebaseUid: fields.firebase_uid,
    email: fields.email,
    displayName: fields.display_name,
    photoURL: fields.photo_url,
    subscriptionStatus: fields.subscription_status,
    subscriptionPlan: fields.subscription_plan,
    subscriptionStart: fields.subscription_start,
    subscriptionEnd: fields.subscription_end,
    phone: fields.phone,
    cpf: fields.cpf ? decrypt(fields.cpf) : null,
    birthDate: fields.birth_date,
    address: fields.address,
    medicalHistory: fields.medical_history ? decrypt(fields.medical_history) : null,
    appointments: fields.appointments || [],
    notes: fields.notes,
    createdAt: fields.created_at,
    updatedAt: fields.updated_at,
  };
}

/**
 * Format appointment record
 * @param {Object} record - Airtable record
 * @returns {Object} Formatted appointment object
 */
function formatAppointmentRecord(record) {
  const fields = record.fields;

  return {
    id: record.id,
    subscriberId: fields.subscriber_id?.[0],
    appointmentDate: fields.appointment_date,
    appointmentTime: fields.appointment_time,
    status: fields.status,
    serviceType: fields.service_type,
    doctorName: fields.doctor_name,
    notes: fields.notes,
    createdAt: fields.created_at,
  };
}

/**
 * Format activity log record
 * @param {Object} record - Airtable record
 * @returns {Object} Formatted activity log object
 */
function formatActivityLogRecord(record) {
  const fields = record.fields;

  let details = {};
  if (fields.details) {
    try {
      details = JSON.parse(fields.details);
    } catch (error) {
      console.error('Error parsing activity log details:', error);
    }
  }

  return {
    id: record.id,
    subscriberId: fields.subscriber_id?.[0],
    action: fields.action,
    timestamp: fields.timestamp,
    ipAddress: fields.ip_address,
    userAgent: fields.user_agent,
    details,
  };
}

/**
 * Health check for Airtable connection
 * @returns {Promise<boolean>} True if connection is healthy
 */
export async function healthCheck() {
  try {
    await base(TABLES.SUBSCRIBERS).select({ maxRecords: 1 }).firstPage();
    return true;
  } catch (error) {
    console.error('Airtable health check failed:', error);
    return false;
  }
}

export default {
  getSubscriberByFirebaseUid,
  getSubscriberById,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getSubscriberAppointments,
  createAppointment,
  updateAppointment,
  logActivity,
  getSubscriberActivityLog,
  healthCheck,
};
