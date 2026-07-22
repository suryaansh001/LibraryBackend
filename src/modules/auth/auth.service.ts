import bcrypt from 'bcrypt';

import { config } from '../../config/env.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';
import { db } from '../../config/database.js';
import { libraries } from '../../db/schema/libraries.js';
import { users } from '../../db/schema/users.js';
import type { LoginResponseDTO, MeResponseDTO } from '../../shared/dto/auth.dto.js';
import { toLibraryResponseDTO, toUserResponseDTO } from '../../shared/dto/auth.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { addDurationToDate } from '../../shared/utils/duration.util.js';
import { generateRefreshToken, hashToken } from '../../shared/utils/token-hash.util.js';
import { signAccessToken } from '../../shared/utils/auth.util.js';
import type { LoginBody, RegisterBody } from './auth.schema.js';
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

export class AuthService {
  public constructor(private readonly repository: AuthRepository) {}

  public async login(body: LoginBody, context: AuthServiceContext = {}): Promise<AuthTokensResult> {
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

  public async register(body: RegisterBody): Promise<AuthTokensResult> {
    const normalizedEmail = body.email.toLowerCase();
    const normalizedSlug = body.librarySlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (normalizedSlug.length < 1) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid library slug. Use letters, numbers, and hyphens.', 400);
    }

    const existingSlug = await this.repository.findLibraryBySlug(normalizedSlug);
    if (existingSlug) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Library slug is already taken. Please choose another.', 409);
    }

    const passwordHash = await AuthService.hashPassword(body.password);

    const [newLib] = await db.insert(libraries).values({
      name: body.libraryName,
      slug: normalizedSlug,
      ownerEmail: normalizedEmail,
      capacity: 100,
      subscriptionPlan: 'trial',
      subscriptionStatus: 'trialing',
    }).returning();

    if (!newLib) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to create library', 500);
    }

    const [newUser] = await db.insert(users).values({
      libraryId: newLib.id,
      name: body.name,
      email: normalizedEmail,
      phone: body.phone ?? null,
      passwordHash,
      role: 'owner',
    }).returning();

    if (!newUser) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to create user', 500);
    }

    const refreshTokenValue = generateRefreshToken();
    const tokenHash = hashToken(refreshTokenValue);
    const expiresAt = addDurationToDate(config.JWT_REFRESH_EXPIRES_IN);

    await this.repository.createRefreshToken({
      userId: newUser.id,
      libraryId: newLib.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken: this.createAccessToken(newUser.id, newLib.id, newUser.role, newUser.email),
      refreshToken: refreshTokenValue,
      user: toUserResponseDTO(newUser),
      library: toLibraryResponseDTO(newLib)
    };
  }

  public async refresh(refreshToken: string): Promise<AuthTokensResult> {
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
      await this.repository.createRefreshToken(
        {
          userId: record.user.id,
          libraryId: record.library.id,
          tokenHash: newTokenHash,
          expiresAt
        },
        tx
      );
    });

    return {
      accessToken: this.createAccessToken(record.user.id, record.library.id, record.user.role, record.user.email),
      refreshToken: newRefreshToken,
      user: toUserResponseDTO(record.user),
      library: toLibraryResponseDTO(record.library)
    };
  }

  public async logout(refreshToken: string | undefined): Promise<void> {
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

  public async getMe(userId: string, libraryId: string): Promise<MeResponseDTO> {
    const record = await this.repository.findUserWithLibraryById(userId, libraryId);
    if (record === null || !record.user.isActive) {
      throw new AppError(ERROR_CODES.TOKEN_INVALID, 'Access token is invalid', 401);
    }

    return {
      user: toUserResponseDTO(record.user),
      library: toLibraryResponseDTO(record.library)
    };
  }

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private createAccessToken(
    userId: string,
    libraryId: string,
    role: AuthTokensResult['user']['role'],
    email: string
  ): string {
    return signAccessToken({
      sub: userId,
      library_id: libraryId,
      role,
      email
    });
  }
}
