import { and, eq, isNull } from 'drizzle-orm';
import { libraries } from '../../db/schema/libraries.js';
import { refreshTokens } from '../../db/schema/refresh-tokens.js';
import { users } from '../../db/schema/users.js';
export class AuthRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByEmailWithLibrary(email, librarySlug) {
        const rows = await this.db
            .select({
            user: users,
            library: libraries
        })
            .from(users)
            .innerJoin(libraries, eq(users.libraryId, libraries.id))
            .where(and(eq(users.email, email), eq(libraries.slug, librarySlug)))
            .limit(1);
        const row = rows[0];
        if (row === undefined) {
            return null;
        }
        return row;
    }
    async findUserWithLibraryById(userId, libraryId) {
        const rows = await this.db
            .select({
            user: users,
            library: libraries
        })
            .from(users)
            .innerJoin(libraries, eq(users.libraryId, libraries.id))
            .where(and(eq(users.id, userId), eq(users.libraryId, libraryId)))
            .limit(1);
        const row = rows[0];
        if (row === undefined) {
            return null;
        }
        return row;
    }
    async findLibraryBySlug(slug) {
        const rows = await this.db
            .select()
            .from(libraries)
            .where(eq(libraries.slug, slug))
            .limit(1);
        return rows[0] ?? null;
    }
    async findLibraryById(libraryId) {
        const rows = await this.db
            .select()
            .from(libraries)
            .where(eq(libraries.id, libraryId))
            .limit(1);
        return rows[0] ?? null;
    }
    async findRefreshTokenByHash(tokenHash) {
        const rows = await this.db
            .select({
            refreshToken: refreshTokens,
            user: users,
            library: libraries
        })
            .from(refreshTokens)
            .innerJoin(users, eq(refreshTokens.userId, users.id))
            .innerJoin(libraries, eq(refreshTokens.libraryId, libraries.id))
            .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
            .limit(1);
        const row = rows[0];
        if (row === undefined) {
            return null;
        }
        return row;
    }
    async createRefreshToken(input, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .insert(refreshTokens)
            .values({
            userId: input.userId,
            libraryId: input.libraryId,
            tokenHash: input.tokenHash,
            expiresAt: input.expiresAt,
            deviceInfo: input.deviceInfo,
            ipAddress: input.ipAddress
        })
            .returning();
        const created = rows[0];
        if (created === undefined) {
            throw new Error('Failed to create refresh token');
        }
        return created;
    }
    async revokeRefreshToken(tokenId, tx) {
        const database = tx ?? this.db;
        await database
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.id, tokenId));
    }
    async updateLastLogin(userId) {
        await this.db
            .update(users)
            .set({ lastLoginAt: new Date(), updatedAt: new Date() })
            .where(eq(users.id, userId));
    }
}
//# sourceMappingURL=auth.repository.js.map