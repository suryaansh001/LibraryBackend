import { type JwtPayload } from 'jsonwebtoken';
export interface JwtClaims extends JwtPayload {
    sub: string;
    library_id: string;
    role: 'owner' | 'staff' | 'receptionist' | 'student';
    email: string;
}
export declare function signAccessToken(claims: JwtClaims): string;
export declare function verifyAccessToken(token: string): JwtClaims;
