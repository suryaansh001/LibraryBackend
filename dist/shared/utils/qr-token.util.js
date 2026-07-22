import crypto from 'node:crypto';
import { config } from '../../config/env.js';
/**
 * Generate a static HMAC-SHA256 signed QR token for a student.
 * Token format: base64url(payload) + '.' + hex(hmac)
 * Generated once at student creation and stored in the students table.
 */
export function generateQrToken(studentId, libraryId) {
    const payload = `${studentId}.${libraryId}.${Date.now()}`;
    const payloadBase64 = Buffer.from(payload).toString('base64url');
    const signature = crypto
        .createHmac('sha256', config.QR_HMAC_SECRET)
        .update(payloadBase64)
        .digest('hex');
    return `${payloadBase64}.${signature}`;
}
/**
 * Verify a QR token using constant-time comparison.
 * Returns the decoded payload if valid, null if invalid.
 * NEVER throws — returns null on any failure (no oracle).
 */
export function verifyQrToken(token) {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1 || dotIndex === 0 || dotIndex === token.length - 1) {
        return null;
    }
    const payloadBase64 = token.substring(0, dotIndex);
    const providedSignature = token.substring(dotIndex + 1);
    const expectedSignature = crypto
        .createHmac('sha256', config.QR_HMAC_SECRET)
        .update(payloadBase64)
        .digest('hex');
    // MANDATORY: Use timingSafeEqual to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    if (providedBuffer.length !== expectedBuffer.length) {
        return null;
    }
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
        return null;
    }
    try {
        const decodedPayload = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
        const parts = decodedPayload.split('.');
        const studentId = parts[0];
        const libraryId = parts[1];
        if (studentId === undefined || libraryId === undefined) {
            return null;
        }
        if (studentId.length === 0 || libraryId.length === 0) {
            return null;
        }
        return { studentId, libraryId };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=qr-token.util.js.map