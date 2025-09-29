import { useMemo } from 'react';

const DEFAULT_SCHEDULE = {
  sunday: { open: null, close: null },
  monday: { open: '08:00', close: '18:00' },
  tuesday: { open: '08:00', close: '18:00' },
  wednesday: { open: '08:00', close: '18:00' },
  thursday: { open: '08:00', close: '18:00' },
  friday: { open: '08:00', close: '18:00' },
  saturday: { open: '08:00', close: '12:00' }
};

const parseTime = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const useWorkingHoursStatus = (schedule = DEFAULT_SCHEDULE, referenceDate = new Date()) => {
  return useMemo(() => {
    const dayKey = referenceDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const slots = schedule[dayKey];

    if (!slots || !slots.open || !slots.close) {
      return { status: 'closed', nextOpening: 'Amanhã às 08:00' };
    }

    const minutesNow = referenceDate.getHours() * 60 + referenceDate.getMinutes();
    const openMinutes = parseTime(slots.open);
    const closeMinutes = parseTime(slots.close);

    if (minutesNow < openMinutes) {
      return { status: 'closed', nextOpening: `${slots.open}` };
    }
    if (minutesNow >= closeMinutes) {
      return { status: 'closed', nextOpening: 'Amanhã às 08:00' };
    }

    return { status: 'open', closesAt: slots.close };
  }, [schedule, referenceDate]);
};

export default useWorkingHoursStatus;
