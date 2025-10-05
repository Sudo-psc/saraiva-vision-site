/**
 * Appointment Utilities
 *
 * Date/time formatting and slot management for Ninsaúde appointment system
 * Handles Brazilian timezone (America/Sao_Paulo) and date formatting
 *
 * @module lib/ninsaude/utils/appointmentUtils
 */

import {
  format,
  parseISO,
  isValid,
  addDays,
  eachDayOfInterval,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Brazilian timezone constant
 * São Paulo is UTC-3 (no DST since 2019)
 */
const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo';

/**
 * Format date/time for Ninsaúde API (ISO 8601 with timezone)
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string|null} Formatted datetime string or null if invalid
 *
 * @example
 * formatSlotDateTime(new Date('2025-10-15T14:30:00-03:00'))
 * // '2025-10-15T14:30:00-03:00'
 */
export function formatSlotDateTime(date) {
  if (!date) {
    return null;
  }

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return null;
    }

    // Format in São Paulo timezone with offset
    return formatInTimeZone(
      dateObj,
      SAO_PAULO_TIMEZONE,
      "yyyy-MM-dd'T'HH:mm:ssXXX"
    );
  } catch (error) {
    return null;
  }
}

/**
 * Parse ISO datetime string to Date object
 *
 * @param {string} dateStr - ISO datetime string
 * @returns {Date|null} Date object or null if invalid
 *
 * @example
 * parseSlotDateTime('2025-10-15T14:30:00-03:00')
 * // Date object for 2025-10-15 14:30
 */
export function parseSlotDateTime(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    return null;
  }
}

/**
 * Convert UTC date to São Paulo timezone
 *
 * @param {Date} utcDate - UTC date object
 * @returns {Date|null} Date in São Paulo timezone or null if invalid
 *
 * @example
 * convertToSaoPauloTimezone(new Date('2025-10-15T17:30:00Z'))
 * // Date object for 2025-10-15 14:30 BRT (UTC-3)
 */
export function convertToSaoPauloTimezone(utcDate) {
  if (!utcDate || !isValid(utcDate)) {
    return null;
  }

  try {
    return toZonedTime(utcDate, SAO_PAULO_TIMEZONE);
  } catch (error) {
    return null;
  }
}

/**
 * Calculate available time slots within a time range
 *
 * @param {string} startTime - Start time (HH:mm format)
 * @param {string} endTime - End time (HH:mm format)
 * @param {number} slotDuration - Duration in minutes
 * @param {Object} [lunchBreak] - Optional lunch break period
 * @param {string} lunchBreak.start - Lunch start time (HH:mm)
 * @param {string} lunchBreak.end - Lunch end time (HH:mm)
 * @returns {string[]} Array of time slots in HH:mm format
 *
 * @example
 * calculateSlotAvailability('09:00', '17:00', 30)
 * // ['09:00', '09:30', '10:00', ..., '16:30']
 *
 * calculateSlotAvailability('09:00', '17:00', 60, { start: '12:00', end: '13:00' })
 * // ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
 */
export function calculateSlotAvailability(
  startTime,
  endTime,
  slotDuration,
  lunchBreak = null
) {
  if (!startTime || !endTime || !slotDuration || slotDuration <= 0) {
    return [];
  }

  try {
    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Validate times
    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      return [];
    }

    // Convert to minutes from midnight
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Start time must be before end time
    if (startMinutes >= endMinutes) {
      return [];
    }

    // Parse lunch break if provided
    let lunchStartMinutes = null;
    let lunchEndMinutes = null;
    if (lunchBreak) {
      const [lunchStartHour, lunchStartMinute] = lunchBreak.start
        .split(':')
        .map(Number);
      const [lunchEndHour, lunchEndMinute] = lunchBreak.end
        .split(':')
        .map(Number);
      lunchStartMinutes = lunchStartHour * 60 + lunchStartMinute;
      lunchEndMinutes = lunchEndHour * 60 + lunchEndMinute;
    }

    // Generate slots
    const slots = [];
    let currentMinutes = startMinutes;

    while (currentMinutes < endMinutes) {
      // Check if slot is during lunch break
      const isLunchTime =
        lunchStartMinutes !== null &&
        lunchEndMinutes !== null &&
        currentMinutes >= lunchStartMinutes &&
        currentMinutes < lunchEndMinutes;

      if (!isLunchTime) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        slots.push(timeStr);
      }

      currentMinutes += slotDuration;
    }

    return slots;
  } catch (error) {
    return [];
  }
}

/**
 * Detect if a new appointment conflicts with existing appointments
 *
 * @param {Object} newAppointment - New appointment to check
 * @param {string} newAppointment.start - Start datetime (ISO string)
 * @param {string} newAppointment.end - End datetime (ISO string)
 * @param {Object[]} existingAppointments - Array of existing appointments
 * @returns {boolean} True if conflict detected
 *
 * @example
 * detectAppointmentConflict(
 *   { start: '2025-10-15T14:00:00-03:00', end: '2025-10-15T15:00:00-03:00' },
 *   [{ start: '2025-10-15T13:00:00-03:00', end: '2025-10-15T14:30:00-03:00' }]
 * )
 * // true (overlaps)
 */
export function detectAppointmentConflict(
  newAppointment,
  existingAppointments
) {
  if (!newAppointment || !existingAppointments) {
    return false;
  }

  if (!Array.isArray(existingAppointments) || existingAppointments.length === 0) {
    return false;
  }

  try {
    const newStart = parseSlotDateTime(newAppointment.start);
    const newEnd = parseSlotDateTime(newAppointment.end);

    if (!newStart || !newEnd) {
      return false;
    }

    // Check each existing appointment for overlap
    for (const existing of existingAppointments) {
      const existingStart = parseSlotDateTime(existing.start);
      const existingEnd = parseSlotDateTime(existing.end);

      if (!existingStart || !existingEnd) {
        continue;
      }

      // Check for overlap
      // Overlap occurs if: (newStart < existingEnd) AND (newEnd > existingStart)
      // But we allow appointments that touch at boundaries (same start/end)
      const overlaps =
        isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart);

      if (overlaps) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Generate array of dates for calendar date range
 *
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Date[]} Array of Date objects for each day in range
 *
 * @example
 * generateDateRange(new Date('2025-10-01'), new Date('2025-10-07'))
 * // [Date(2025-10-01), Date(2025-10-02), ..., Date(2025-10-07)]
 */
export function generateDateRange(startDate, endDate) {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return [];
  }

  // End date must be after or equal to start date
  if (isBefore(endDate, startDate)) {
    return [];
  }

  try {
    return eachDayOfInterval({ start: startDate, end: endDate });
  } catch (error) {
    return [];
  }
}

/**
 * Format appointment time for display (HH:mm)
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted time (HH:mm) or empty string if invalid
 *
 * @example
 * formatAppointmentTime(new Date('2025-10-15T14:30:00-03:00'))
 * // '14:30'
 */
export function formatAppointmentTime(date) {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '';
    }

    // Format in São Paulo timezone
    return formatInTimeZone(dateObj, SAO_PAULO_TIMEZONE, 'HH:mm');
  } catch (error) {
    return '';
  }
}

/**
 * Check if a time slot is in the past
 *
 * @param {Date|string} slotDate - Slot date/time
 * @returns {boolean} True if slot is in the past
 *
 * @example
 * isSlotInPast(new Date('2025-10-05T09:00:00-03:00'))
 * // true (if current time is after 09:00)
 */
export function isSlotInPast(slotDate) {
  if (!slotDate) {
    return false;
  }

  try {
    const dateObj = typeof slotDate === 'string' ? parseISO(slotDate) : slotDate;

    if (!isValid(dateObj)) {
      return false;
    }

    return isBefore(dateObj, new Date());
  } catch (error) {
    return false;
  }
}

/**
 * Group slots by date for calendar display
 *
 * @param {Object[]} slots - Array of slot objects with datetime property
 * @returns {Object} Object with dates as keys and arrays of slots as values
 *
 * @example
 * groupSlotsByDate([
 *   { datetime: '2025-10-15T09:00:00-03:00' },
 *   { datetime: '2025-10-15T10:00:00-03:00' },
 *   { datetime: '2025-10-16T09:00:00-03:00' }
 * ])
 * // {
 * //   '2025-10-15': [{ datetime: '...' }, { datetime: '...' }],
 * //   '2025-10-16': [{ datetime: '...' }]
 * // }
 */
export function groupSlotsByDate(slots) {
  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return {};
  }

  try {
    const grouped = {};

    for (const slot of slots) {
      if (!slot.datetime) {
        continue;
      }

      const date = parseSlotDateTime(slot.datetime);
      if (!date) {
        continue;
      }

      const dateKey = format(date, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(slot);
    }

    return grouped;
  } catch (error) {
    return {};
  }
}

/**
 * Filter slots to show only future available slots
 *
 * @param {Object[]} slots - Array of slot objects
 * @returns {Object[]} Filtered array of available future slots
 *
 * @example
 * filterAvailableSlots([
 *   { datetime: '2025-10-05T09:00:00-03:00', available: true },  // past
 *   { datetime: '2025-10-05T11:00:00-03:00', available: true },  // future
 *   { datetime: '2025-10-05T12:00:00-03:00', available: false }  // booked
 * ])
 * // [{ datetime: '2025-10-05T11:00:00-03:00', available: true }]
 */
export function filterAvailableSlots(slots) {
  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return [];
  }

  try {
    return slots.filter((slot) => {
      // Must have datetime
      if (!slot.datetime) {
        return false;
      }

      // Must be available
      if (slot.available === false) {
        return false;
      }

      // Must be in the future
      if (isSlotInPast(slot.datetime)) {
        return false;
      }

      return true;
    });
  } catch (error) {
    return [];
  }
}
