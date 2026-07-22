import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { libraries } from '../../db/schema/libraries.js';
import { refreshTokens } from '../../db/schema/refresh-tokens.js';
import { users } from '../../db/schema/users.js';

type Database = NodePgDatabase<typeof schema>;

export interface UserWithLibrary {
  user: typeof users.$inferSelect;
  library: typeof libraries.$inferSelect;
}

export interface RefreshTokenWithUser {
  refreshToken: typeof refreshTokens.$inferSelect;
  user: typeof users.$inferSelect;
  library: typeof libraries.$inferSelect;
}

export class AuthRepository {
  public constructor(private readonly db: Database) {}

  public async findByEmailWithLibrary(email: string, librarySlug: string): Promise<UserWithLibrary | null> {
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

  public async findUserWithLibraryById(userId: string, libraryId: string): Promise<UserWithLibrary | null> {
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

  public async findLibraryBySlug(slug: string): Promise<typeof libraries.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(libraries)
      .where(eq(libraries.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  }

  public async findLibraryById(libraryId: string): Promise<typeof libraries.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(libraries)
      .where(eq(libraries.id, libraryId))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenWithUser | null> {
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

  public async createRefreshToken(
    input: {
      userId: string;
      libraryId: string;
      tokenHash: string;
      expiresAt: Date;
      deviceInfo?: string;
      ipAddress?: string;
    },
    tx?: Database
  ): Promise<typeof refreshTokens.$inferSelect> {
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

  public async revokeRefreshToken(tokenId: string, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenId));
  }

  public async updateLastLogin(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
