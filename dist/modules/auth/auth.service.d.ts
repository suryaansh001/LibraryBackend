import type { LoginResponseDTO, MeResponseDTO } from '../../shared/dto/auth.dto.js';
import type { LoginBody } from './auth.schema.js';
import type { AuthRepository } from './auth.repository.js';
export interface AuthServiceContext {
    ipAddress?: string;
    deviceInfo?: string;
}
interface AuthTokensResult {
    accessToken: string;
    refreshToken: string;
    user: LoginResponseDTO['user'];
    library: LoginResponseDTO['library'];
}
export declare class AuthService {
    private readonly repository;
    constructor(repository: AuthRepository);
    login(body: LoginBody, context?: AuthServiceContext): Promise<AuthTokensResult>;
    refresh(refreshToken: string): Promise<AuthTokensResult>;
    logout(refreshToken: string | undefined): Promise<void>;
    getMe(userId: string, libraryId: string): Promise<MeResponseDTO>;
    static hashPassword(password: string): Promise<string>;
    private createAccessToken;
}
export {};
