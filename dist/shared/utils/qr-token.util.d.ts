interface QrTokenPayload {
    studentId: string;
    libraryId: string;
}
/**
 * Generate a static HMAC-SHA256 signed QR token for a student.
 * Token format: base64url(payload) + '.' + hex(hmac)
 * Generated once at student creation and stored in the students table.
 */
export declare function generateQrToken(studentId: string, libraryId: string): string;
/**
 * Verify a QR token using constant-time comparison.
 * Returns the decoded payload if valid, null if invalid.
 * NEVER throws — returns null on any failure (no oracle).
 */
export declare function verifyQrToken(token: string): QrTokenPayload | null;
export {};
