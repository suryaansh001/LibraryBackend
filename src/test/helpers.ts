import { eq } from 'drizzle-orm';

import { buildApp, type LibraryOsApp } from '../app.js';
import { db, pool } from '../config/database.js';
import { libraries } from '../db/schema/libraries.js';
import { refreshTokens } from '../db/schema/refresh-tokens.js';
import { users } from '../db/schema/users.js';
import { AuthService } from '../modules/auth/auth.service.js';

export interface TestSeedData {
  libraryId: string;
  userId: string;
  librarySlug: string;
  email: string;
  password: string;
}

export async function createTestApp(): Promise<LibraryOsApp> {
  const app = buildApp();
  await app.ready();
  return app;
}

export async function seedAuthTestData(options?: {
  email?: string;
  password?: string;
  librarySlug?: string;
}): Promise<TestSeedData> {
  const email = options?.email ?? `owner-${crypto.randomUUID()}@test.local`;
  const password = options?.password ?? 'password123';
  const librarySlug = options?.librarySlug ?? `test-lib-${crypto.randomUUID().slice(0, 8)}`;
  const passwordHash = await AuthService.hashPassword(password);

  const [library] = await db
    .insert(libraries)
    .values({
      name: 'Test Library',
      slug: librarySlug,
      ownerEmail: email,
      subscriptionStatus: 'active'
    })
    .returning();

  if (library === undefined) {
    throw new Error('Failed to seed library');
  }

  const [user] = await db
    .insert(users)
    .values({
      libraryId: library.id,
      name: 'Test Owner',
      email,
      passwordHash,
      role: 'owner'
    })
    .returning();

  if (user === undefined) {
    throw new Error('Failed to seed user');
  }

  return {
    libraryId: library.id,
    userId: user.id,
    librarySlug,
    email,
    password
  };
}

export async function cleanupAuthTestData(seed: TestSeedData): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.libraryId, seed.libraryId));
  await db.delete(users).where(eq(users.id, seed.userId));
  await db.delete(libraries).where(eq(libraries.id, seed.libraryId));
}

export async function closeTestResources(app?: LibraryOsApp): Promise<void> {
  if (app !== undefined) {
    await app.close();
  }

  await pool.end();
}

function extractCookie(setCookieHeader: string | string[] | undefined, cookieName: string): string | undefined {
  if (setCookieHeader === undefined) {
    return undefined;
  }

  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const match = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));
  if (match === undefined) {
    return undefined;
  }

  const valuePart = match.split(';')[0];
  if (valuePart === undefined) {
    return undefined;
  }

  return valuePart.replace(`${cookieName}=`, '');
}

export function getRefreshTokenFromResponse(setCookieHeader: string | string[] | undefined): string | undefined {
  return extractCookie(setCookieHeader, 'refresh_token');
}
