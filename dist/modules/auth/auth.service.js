import bcrypt from 'bcrypt';
import { config } from '../../config/env.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';
import { db } from '../../config/database.js';
import { toLibraryResponseDTO, toUserResponseDTO } from '../../shared/dto/auth.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { addDurationToDate } from '../../shared/utils/duration.util.js';
import { generateRefreshToken, hashToken } from '../../shared/utils/token-hash.util.js';
import { signAccessToken } from '../../shared/utils/auth.util.js';
export class AuthService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async login(body, context = {}) {
        const normalizedEmail = body.email.toLowerCase();
        const record = await this.repository.findByEmailWithLibrary(normalizedEmail, body.librarySlug);
        if (record === null || !record.user.isActive) {
            throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password', 401);
        }
        const passwordMatches = await bcrypt.compare(body.password, record.user.passwordHash);
        if (!passwordMatches) {
            throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password', 401);
        }
        if (record.library.subscriptionStatus === 'cancelled') {
            throw new AppError(ERROR_CODES.SUBSCRIPTION_CANCELLED, 'Library subscription has been cancelled', 402);
        }
        const refreshToken = generateRefreshToken();
        const tokenHash = hashToken(refreshToken);
        const expiresAt = addDurationToDate(config.JWT_REFRESH_EXPIRES_IN);
        await this.repository.createRefreshToken({
            userId: record.user.id,
            libraryId: record.library.id,
            tokenHash,
            expiresAt,
            deviceInfo: context.deviceInfo,
            ipAddress: context.ipAddress
        });
        await this.repository.updateLastLogin(record.user.id);
        return {
            accessToken: this.createAccessToken(record.user.id, record.library.id, record.user.role, record.user.email),
            refreshToken,
            user: toUserResponseDTO(record.user),
            library: toLibraryResponseDTO(record.library)
        };
    }
    async refresh(refreshToken) {
        const tokenHash = hashToken(refreshToken);
        const record = await this.repository.findRefreshTokenByHash(tokenHash);
        if (record === null) {
            throw new AppError(ERROR_CODES.REFRESH_TOKEN_INVALID, 'Refresh token is invalid', 401);
        }
        if (record.refreshToken.expiresAt.getTime() <= Date.now()) {
            throw new AppError(ERROR_CODES.REFRESH_TOKEN_EXPIRED, 'Refresh token has expired', 401);
        }
        if (!record.user.isActive) {
            throw new AppError(ERROR_CODES.REFRESH_TOKEN_INVALID, 'Refresh token is invalid', 401);
        }
        if (record.library.subscriptionStatus === 'cancelled') {
            throw new AppError(ERROR_CODES.SUBSCRIPTION_CANCELLED, 'Library subscription has been cancelled', 402);
        }
        const newRefreshToken = generateRefreshToken();
        const newTokenHash = hashToken(newRefreshToken);
        const expiresAt = addDurationToDate(config.JWT_REFRESH_EXPIRES_IN);
        await db.transaction(async (tx) => {
            await this.repository.revokeRefreshToken(record.refreshToken.id, tx);
            await this.repository.createRefreshToken({
                userId: record.user.id,
                libraryId: record.library.id,
                tokenHash: newTokenHash,
                expiresAt
            }, tx);
        });
        return {
            accessToken: this.createAccessToken(record.user.id, record.library.id, record.user.role, record.user.email),
            refreshToken: newRefreshToken,
            user: toUserResponseDTO(record.user),
            library: toLibraryResponseDTO(record.library)
        };
    }
    async logout(refreshToken) {
        if (refreshToken === undefined || refreshToken.length === 0) {
            return;
        }
        const tokenHash = hashToken(refreshToken);
        const record = await this.repository.findRefreshTokenByHash(tokenHash);
        if (record === null) {
            return;
        }
        await this.repository.revokeRefreshToken(record.refreshToken.id);
    }
    async getMe(userId, libraryId) {
        const record = await this.repository.findUserWithLibraryById(userId, libraryId);
        if (record === null || !record.user.isActive) {
            throw new AppError(ERROR_CODES.TOKEN_INVALID, 'Access token is invalid', 401);
        }
        return {
            user: toUserResponseDTO(record.user),
            library: toLibraryResponseDTO(record.library)
        };
    }
    static async hashPassword(password) {
        return bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    createAccessToken(userId, libraryId, role, email) {
        return signAccessToken({
            sub: userId,
            library_id: libraryId,
            role,
            email
        });
    }
}
//# sourceMappingURL=auth.service.js.map