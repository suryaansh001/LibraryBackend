import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
export function signAccessToken(claims) {
    return jwt.sign(claims, config.JWT_PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: config.JWT_ACCESS_EXPIRES_IN,
        keyid: 'libraryos-access'
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_PUBLIC_KEY, {
        algorithms: ['RS256']
    });
}
//# sourceMappingURL=jwt.util.js.map