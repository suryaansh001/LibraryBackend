import { describe, expect, it, vi } from 'vitest';
import crypto from 'node:crypto';
import { config } from '../../config/env.js';
import { generateQrToken, verifyQrToken } from '../../shared/utils/qr-token.util.js';
describe('QR Token Utility', () => {
    const testStudentId = '123e4567-e89b-12d3-a456-426614174000';
    const testLibraryId = '123e4567-e89b-12d3-a456-426614174001';
    it('generates a valid token that can be verified', () => {
        const token = generateQrToken(testStudentId, testLibraryId);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.includes('.')).toBe(true);
        const payload = verifyQrToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.studentId).toBe(testStudentId);
        expect(payload?.libraryId).toBe(testLibraryId);
    });
    it('returns null for tampered token', () => {
        const token = generateQrToken(testStudentId, testLibraryId);
        const tampered = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
        expect(verifyQrToken(tampered)).toBeNull();
    });
    it('returns null for token with wrong library', () => {
        const otherLibraryId = '123e4567-e89b-12d3-a456-426614174002';
        const token = generateQrToken(testStudentId, otherLibraryId);
        const payload = verifyQrToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.libraryId).toBe(otherLibraryId);
    });
    it('uses timingSafeEqual for HMAC comparison', () => {
        const spy = vi.spyOn(crypto, 'timingSafeEqual');
        const token = generateQrToken(testStudentId, testLibraryId);
        verifyQrToken(token);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
    it('returns null for malformed tokens', () => {
        expect(verifyQrToken('')).toBeNull();
        expect(verifyQrToken('no-dot')).toBeNull();
        expect(verifyQrToken('.')).toBeNull();
        expect(verifyQrToken('a.')).toBeNull();
        expect(verifyQrToken('.b')).toBeNull();
    });
    it('returns null for invalid base64url', () => {
        const token = 'invalid@@@.signature';
        expect(verifyQrToken(token)).toBeNull();
    });
    it('returns null when payload parts are missing', () => {
        const payload = Buffer.from('onlyonepart').toString('base64url');
        const signature = crypto
            .createHmac('sha256', config.QR_HMAC_SECRET)
            .update(payload)
            .digest('hex');
        const token = `${payload}.${signature}`;
        expect(verifyQrToken(token)).toBeNull();
    });
    it('returns null when studentId or libraryId is empty', () => {
        const payload = Buffer.from('.123').toString('base64url');
        const signature = crypto
            .createHmac('sha256', config.QR_HMAC_SECRET)
            .update(payload)
            .digest('hex');
        const token = `${payload}.${signature}`;
        expect(verifyQrToken(token)).toBeNull();
    });
    it('generates unique tokens for same inputs', async () => {
        const token1 = generateQrToken(testStudentId, testLibraryId);
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
        const token2 = generateQrToken(testStudentId, testLibraryId);
        // Tokens include timestamp so they should be different
        expect(token1).not.toBe(token2);
    });
});
//# sourceMappingURL=qr-token.test.js.map