/**
 * Utility functions for date formatting and timezone handling.
 */
/**
 * Format a Date to an ISO 8601 string.
 * Returns null if the date is null or undefined.
 */
export declare function toISOString(date: Date | null | undefined): string | null;
/**
 * Get the start of a day in UTC for a given date string (YYYY-MM-DD).
 */
export declare function startOfDayUTC(dateStr: string): Date;
/**
 * Get the end of a day in UTC for a given date string (YYYY-MM-DD).
 */
export declare function endOfDayUTC(dateStr: string): Date;
/**
 * Get today's date as a YYYY-MM-DD string.
 */
export declare function todayDateString(): string;
