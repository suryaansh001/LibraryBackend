import jwt, { type JwtPayload } from 'jsonwebtoken';

import { config } from '../../config/env.js';

export interface JwtClaims extends JwtPayload {
  sub: string;
  library_id: string;
  role: 'owner' | 'staff' | 'receptionist' | 'student';
  email: string;
}

export function signAccessToken(claims: JwtClaims): string {
  return jwt.sign(claims, config.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    keyid: 'libraryos-access'
  });
}

export function verifyAccessToken(token: string): JwtClaims {
  return jwt.verify(token, config.JWT_PUBLIC_KEY, {
    algorithms: ['RS256']
  }) as JwtClaims;
}