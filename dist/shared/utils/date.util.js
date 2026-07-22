/**
 * Utility functions for date formatting and timezone handling.
 */
/**
 * Format a Date to an ISO 8601 string.
 * Returns null if the date is null or undefined.
 */
export function toISOString(date) {
    if (date === null || date === undefined) {
        return null;
    }
    return date.toISOString();
}
/**
 * Get the start of a day in UTC for a given date string (YYYY-MM-DD).
 */
export function startOfDayUTC(dateStr) {
    return new Date(`${dateStr}T00:00:00.000Z`);
}
/**
 * Get the end of a day in UTC for a given date string (YYYY-MM-DD).
 */
export function endOfDayUTC(dateStr) {
    return new Date(`${dateStr}T23:59:59.999Z`);
}
/**
 * Get today's date as a YYYY-MM-DD string.
 */
export function todayDateString() {
    return new Date().toISOString().split('T')[0];
}
//# sourceMappingURL=date.util.js.map