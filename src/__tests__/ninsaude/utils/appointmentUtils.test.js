import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatSlotDateTime,
  parseSlotDateTime,
  convertToSaoPauloTimezone,
  calculateSlotAvailability,
  detectAppointmentConflict,
  generateDateRange,
  formatAppointmentTime,
  isSlotInPast,
  groupSlotsByDate,
  filterAvailableSlots,
} from '@/lib/ninsaude/utils/appointmentUtils';

describe('appointmentUtils', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.setSystemTime(new Date('2025-10-05T10:00:00-03:00'));
  });

  describe('formatSlotDateTime', () => {
    it('should format date and time for Ninsaúde API', () => {
      const date = new Date('2025-10-15T14:30:00-03:00');
      const formatted = formatSlotDateTime(date);

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(formatted).toContain('2025-10-15');
      expect(formatted).toContain('14:30:00');
    });

    it('should handle different timezones', () => {
      const date = new Date('2025-10-15T14:30:00Z');
      const formatted = formatSlotDateTime(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return null for invalid dates', () => {
      expect(formatSlotDateTime(null)).toBe(null);
      expect(formatSlotDateTime(undefined)).toBe(null);
      expect(formatSlotDateTime('invalid')).toBe(null);
    });
  });

  describe('parseSlotDateTime', () => {
    it('should parse ISO datetime string to Date object', () => {
      const dateStr = '2025-10-15T14:30:00-03:00';
      const parsed = parseSlotDateTime(dateStr);

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2025);
      expect(parsed.getMonth()).toBe(9); // October (0-indexed)
      expect(parsed.getDate()).toBe(15);
    });

    it('should handle different datetime formats', () => {
      const formats = [
        '2025-10-15T14:30:00-03:00',
        '2025-10-15T14:30:00Z',
        '2025-10-15 14:30:00',
      ];

      formats.forEach((format) => {
        const parsed = parseSlotDateTime(format);
        expect(parsed).toBeInstanceOf(Date);
      });
    });

    it('should return null for invalid datetime strings', () => {
      expect(parseSlotDateTime('')).toBe(null);
      expect(parseSlotDateTime('invalid-date')).toBe(null);
      expect(parseSlotDateTime(null)).toBe(null);
    });
  });

  describe('convertToSaoPauloTimezone', () => {
    it('should convert UTC to Brazil/São Paulo timezone', () => {
      const utcDate = new Date('2025-10-15T17:30:00Z');
      const spDate = convertToSaoPauloTimezone(utcDate);

      expect(spDate).toBeInstanceOf(Date);
      // São Paulo is UTC-3, so 17:30 UTC = 14:30 BRT
      expect(spDate.getHours()).toBe(14);
      expect(spDate.getMinutes()).toBe(30);
    });

    it('should handle daylight saving time transitions', () => {
      // Brazil doesn't have DST since 2019, but test the function
      const winterDate = new Date('2025-07-15T17:30:00Z');
      const summerDate = new Date('2025-12-15T17:30:00Z');

      const winterSP = convertToSaoPauloTimezone(winterDate);
      const summerSP = convertToSaoPauloTimezone(summerDate);

      expect(winterSP).toBeInstanceOf(Date);
      expect(summerSP).toBeInstanceOf(Date);
    });

    it('should return null for invalid input', () => {
      expect(convertToSaoPauloTimezone(null)).toBe(null);
      expect(convertToSaoPauloTimezone(undefined)).toBe(null);
    });
  });

  describe('calculateSlotAvailability', () => {
    it('should calculate available slots from total duration', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const slotDuration = 30; // minutes

      const slots = calculateSlotAvailability(startTime, endTime, slotDuration);

      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBe(16); // 8 hours = 480 minutes / 30 = 16 slots
      expect(slots[0]).toBe('09:00');
      expect(slots[slots.length - 1]).toBe('16:30');
    });

    it('should handle different slot durations', () => {
      const startTime = '09:00';
      const endTime = '12:00';

      const slots15 = calculateSlotAvailability(startTime, endTime, 15);
      const slots60 = calculateSlotAvailability(startTime, endTime, 60);

      expect(slots15.length).toBe(12); // 3 hours = 180 minutes / 15 = 12
      expect(slots60.length).toBe(3); // 3 hours / 60 = 3
    });

    it('should exclude lunch break if provided', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const slotDuration = 60;
      const lunchBreak = { start: '12:00', end: '13:00' };

      const slots = calculateSlotAvailability(
        startTime,
        endTime,
        slotDuration,
        lunchBreak
      );

      expect(slots).not.toContain('12:00');
      expect(slots).toContain('11:00');
      expect(slots).toContain('13:00');
    });

    it('should return empty array for invalid input', () => {
      expect(calculateSlotAvailability('', '', 30)).toEqual([]);
      expect(calculateSlotAvailability('09:00', '08:00', 30)).toEqual([]);
      expect(calculateSlotAvailability('09:00', '17:00', 0)).toEqual([]);
    });
  });

  describe('detectAppointmentConflict', () => {
    it('should detect overlapping appointments', () => {
      const newAppointment = {
        start: '2025-10-15T14:00:00-03:00',
        end: '2025-10-15T15:00:00-03:00',
      };

      const existingAppointments = [
        {
          start: '2025-10-15T13:00:00-03:00',
          end: '2025-10-15T14:30:00-03:00',
        },
      ];

      const conflict = detectAppointmentConflict(
        newAppointment,
        existingAppointments
      );

      expect(conflict).toBe(true);
    });

    it('should allow non-overlapping appointments', () => {
      const newAppointment = {
        start: '2025-10-15T14:00:00-03:00',
        end: '2025-10-15T15:00:00-03:00',
      };

      const existingAppointments = [
        {
          start: '2025-10-15T15:00:00-03:00',
          end: '2025-10-15T16:00:00-03:00',
        },
        {
          start: '2025-10-15T12:00:00-03:00',
          end: '2025-10-15T13:00:00-03:00',
        },
      ];

      const conflict = detectAppointmentConflict(
        newAppointment,
        existingAppointments
      );

      expect(conflict).toBe(false);
    });

    it('should handle edge cases (same start/end times)', () => {
      const newAppointment = {
        start: '2025-10-15T14:00:00-03:00',
        end: '2025-10-15T15:00:00-03:00',
      };

      const existingAppointments = [
        {
          start: '2025-10-15T15:00:00-03:00',
          end: '2025-10-15T16:00:00-03:00',
        },
      ];

      const conflict = detectAppointmentConflict(
        newAppointment,
        existingAppointments
      );

      // Appointments touching at boundaries should not conflict
      expect(conflict).toBe(false);
    });

    it('should return false for empty existing appointments', () => {
      const newAppointment = {
        start: '2025-10-15T14:00:00-03:00',
        end: '2025-10-15T15:00:00-03:00',
      };

      const conflict = detectAppointmentConflict(newAppointment, []);

      expect(conflict).toBe(false);
    });
  });

  describe('generateDateRange', () => {
    it('should generate array of dates for calendar', () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-10-07');

      const range = generateDateRange(startDate, endDate);

      expect(Array.isArray(range)).toBe(true);
      expect(range.length).toBe(7);
      expect(range[0]).toBeInstanceOf(Date);
      expect(range[0].getDate()).toBe(1);
      expect(range[6].getDate()).toBe(7);
    });

    it('should handle single day range', () => {
      const date = new Date('2025-10-15');

      const range = generateDateRange(date, date);

      expect(range.length).toBe(1);
      expect(range[0].getDate()).toBe(15);
    });

    it('should handle month transitions', () => {
      const startDate = new Date('2025-10-29');
      const endDate = new Date('2025-11-02');

      const range = generateDateRange(startDate, endDate);

      expect(range.length).toBe(5);
      expect(range[0].getMonth()).toBe(9); // October
      expect(range[4].getMonth()).toBe(10); // November
    });

    it('should return empty array for invalid dates', () => {
      expect(generateDateRange(null, new Date())).toEqual([]);
      expect(generateDateRange(new Date(), null)).toEqual([]);
      expect(
        generateDateRange(new Date('2025-10-15'), new Date('2025-10-10'))
      ).toEqual([]);
    });
  });

  describe('formatAppointmentTime', () => {
    it('should format time for display (HH:MM)', () => {
      const date = new Date('2025-10-15T14:30:00-03:00');

      expect(formatAppointmentTime(date)).toBe('14:30');
    });

    it('should pad single digit hours and minutes', () => {
      const date = new Date('2025-10-15T09:05:00-03:00');

      expect(formatAppointmentTime(date)).toBe('09:05');
    });

    it('should return empty string for invalid input', () => {
      expect(formatAppointmentTime(null)).toBe('');
      expect(formatAppointmentTime(undefined)).toBe('');
      expect(formatAppointmentTime('invalid')).toBe('');
    });
  });

  describe('isSlotInPast', () => {
    it('should detect past slots', () => {
      const pastSlot = new Date('2025-10-05T09:00:00-03:00');

      expect(isSlotInPast(pastSlot)).toBe(true);
    });

    it('should detect future slots', () => {
      const futureSlot = new Date('2025-10-05T11:00:00-03:00');

      expect(isSlotInPast(futureSlot)).toBe(false);
    });

    it('should handle current time edge case', () => {
      const currentSlot = new Date('2025-10-05T10:00:00-03:00');

      // Should be false (not in past)
      expect(isSlotInPast(currentSlot)).toBe(false);
    });
  });

  describe('groupSlotsByDate', () => {
    it('should group slots by date', () => {
      const slots = [
        { datetime: '2025-10-15T09:00:00-03:00' },
        { datetime: '2025-10-15T10:00:00-03:00' },
        { datetime: '2025-10-16T09:00:00-03:00' },
        { datetime: '2025-10-16T10:00:00-03:00' },
      ];

      const grouped = groupSlotsByDate(slots);

      expect(Object.keys(grouped).length).toBe(2);
      expect(grouped['2025-10-15'].length).toBe(2);
      expect(grouped['2025-10-16'].length).toBe(2);
    });

    it('should return empty object for empty array', () => {
      expect(groupSlotsByDate([])).toEqual({});
    });

    it('should handle single date', () => {
      const slots = [
        { datetime: '2025-10-15T09:00:00-03:00' },
        { datetime: '2025-10-15T10:00:00-03:00' },
      ];

      const grouped = groupSlotsByDate(slots);

      expect(Object.keys(grouped).length).toBe(1);
      expect(grouped['2025-10-15'].length).toBe(2);
    });
  });

  describe('filterAvailableSlots', () => {
    it('should filter out past and booked slots', () => {
      const slots = [
        {
          datetime: '2025-10-05T09:00:00-03:00',
          available: true,
        }, // past
        {
          datetime: '2025-10-05T11:00:00-03:00',
          available: true,
        }, // future, available
        {
          datetime: '2025-10-05T12:00:00-03:00',
          available: false,
        }, // future, booked
        {
          datetime: '2025-10-05T13:00:00-03:00',
          available: true,
        }, // future, available
      ];

      const filtered = filterAvailableSlots(slots);

      expect(filtered.length).toBe(2);
      expect(filtered[0].datetime).toBe('2025-10-05T11:00:00-03:00');
      expect(filtered[1].datetime).toBe('2025-10-05T13:00:00-03:00');
    });

    it('should return empty array when no slots available', () => {
      const slots = [
        {
          datetime: '2025-10-05T09:00:00-03:00',
          available: true,
        }, // past
        {
          datetime: '2025-10-05T11:00:00-03:00',
          available: false,
        }, // booked
      ];

      const filtered = filterAvailableSlots(slots);

      expect(filtered.length).toBe(0);
    });

    it('should handle empty input', () => {
      expect(filterAvailableSlots([])).toEqual([]);
      expect(filterAvailableSlots(null)).toEqual([]);
    });
  });
});
