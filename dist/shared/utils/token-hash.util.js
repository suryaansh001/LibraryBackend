import { createHash } from 'node:crypto';
export function generateRefreshToken() {
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
export function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
//# sourceMappingURL=token-hash.util.js.map