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
export declare class AuthRepository {
    private readonly db;
    constructor(db: Database);
    findByEmailWithLibrary(email: string, librarySlug: string): Promise<UserWithLibrary | null>;
    findUserWithLibraryById(userId: string, libraryId: string): Promise<UserWithLibrary | null>;
    findLibraryById(libraryId: string): Promise<typeof libraries.$inferSelect | null>;
    findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenWithUser | null>;
    createRefreshToken(input: {
        userId: string;
        libraryId: string;
        tokenHash: string;
        expiresAt: Date;
        deviceInfo?: string;
        ipAddress?: string;
    }, tx?: Database): Promise<typeof refreshTokens.$inferSelect>;
    revokeRefreshToken(tokenId: string, tx?: Database): Promise<void>;
    updateLastLogin(userId: string): Promise<void>;
}
export {};
