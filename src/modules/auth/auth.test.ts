import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { config } from '../../config/env.js';
import { REFRESH_TOKEN_COOKIE } from '../../config/constants.js';
import {
  cleanupAuthTestData,
  closeTestResources,
  createTestApp,
  getRefreshTokenFromResponse,
  seedAuthTestData,
  type TestSeedData
} from '../../test/helpers.js';
import type { LibraryOsApp } from '../../app.js';

describe('Auth module', () => {
  let app: LibraryOsApp;
  let seed: TestSeedData;

  beforeAll(async () => {
    app = await createTestApp();
    seed = await seedAuthTestData();
  });

  afterAll(async () => {
    await cleanupAuthTestData(seed);
    await closeTestResources(app);
  });

  it('logs in successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toEqual(expect.any(String));
    expect(body.data.user.email).toBe(seed.email);
    expect(body.data.library.slug).toBe(seed.librarySlug);
    expect(getRefreshTokenFromResponse(response.headers['set-cookie'])).toEqual(expect.any(String));
  });

  it('returns 401 for wrong password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: 'wrong-password',
        librarySlug: seed.librarySlug
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent user with same error message', async () => {
    const wrongPasswordResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: 'wrong-password',
        librarySlug: seed.librarySlug
      }
    });

    const missingUserResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'missing-user@test.local',
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    expect(missingUserResponse.statusCode).toBe(401);
    expect(missingUserResponse.json().error.code).toBe('INVALID_CREDENTIALS');
    expect(missingUserResponse.json().error.message).toBe(wrongPasswordResponse.json().error.message);
  });

  it('refreshes access token successfully', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    const refreshToken = getRefreshTokenFromResponse(loginResponse.headers['set-cookie']);
    expect(refreshToken).toBeDefined();

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`
      }
    });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.json().data.accessToken).toEqual(expect.any(String));
    expect(getRefreshTokenFromResponse(refreshResponse.headers['set-cookie'])).toEqual(expect.any(String));
  });

  it('rotates refresh token and invalidates the old token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    const oldRefreshToken = getRefreshTokenFromResponse(loginResponse.headers['set-cookie']);
    expect(oldRefreshToken).toBeDefined();

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=${oldRefreshToken}`
      }
    });

    expect(refreshResponse.statusCode).toBe(200);

    const retryOldTokenResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=${oldRefreshToken}`
      }
    });

    expect(retryOldTokenResponse.statusCode).toBe(401);
    expect(retryOldTokenResponse.json().error.code).toBe('REFRESH_TOKEN_INVALID');
  });

  it('logs out and revokes refresh token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    const refreshToken = getRefreshTokenFromResponse(loginResponse.headers['set-cookie']);
    expect(refreshToken).toBeDefined();

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`
      }
    });

    expect(logoutResponse.statusCode).toBe(200);

    const refreshAfterLogout = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`
      }
    });

    expect(refreshAfterLogout.statusCode).toBe(401);
    expect(refreshAfterLogout.json().error.code).toBe('REFRESH_TOKEN_INVALID');
  });

  it('returns 401 for expired access token', async () => {
    const expiredToken = jwt.sign(
      {
        sub: seed.userId,
        library_id: seed.libraryId,
        role: 'owner',
        email: seed.email
      },
      config.JWT_PRIVATE_KEY,
      {
        algorithm: 'RS256',
        expiresIn: '-1s'
      }
    );

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('TOKEN_EXPIRED');
  });

  it('returns current user profile from /auth/me', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seed.email,
        password: seed.password,
        librarySlug: seed.librarySlug
      }
    });

    const accessToken = loginResponse.json().data.accessToken as string;

    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().data.user.email).toBe(seed.email);
    expect(meResponse.json().data.library.slug).toBe(seed.librarySlug);
  });
});
