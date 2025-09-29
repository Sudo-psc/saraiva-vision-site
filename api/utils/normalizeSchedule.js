// server/api/normalizeSchedule.js
export function normalizeSchedule(input) {
    const weekdays = Array.isArray(input?.weekdays) ? input.weekdays : null;
    return {
        weekdays: weekdays ?? null,
        open: input?.open ?? null,
        close: input?.close ?? null
    };
}
