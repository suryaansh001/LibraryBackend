import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '../../config/database.js';
import { students } from '../../db/schema/students.js';
import {
  cleanupAuthTestData,
  closeTestResources,
  createTestApp,
  seedAuthTestData,
  type TestSeedData
} from '../../test/helpers.js';
import type { LibraryOsApp } from '../../app.js';
import { AuthService } from '../auth/auth.service.js';

describe('Student module', () => {
  let app: LibraryOsApp;
  let seedA: TestSeedData;
  let seedB: TestSeedData;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    app = await createTestApp();
    seedA = await seedAuthTestData();
    seedB = await seedAuthTestData();

    // Login to get tokens
    const loginARes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seedA.email,
        password: seedA.password,
        librarySlug: seedA.librarySlug
      }
    });
    tokenA = loginARes.json().data.accessToken as string;

    const loginBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: seedB.email,
        password: seedB.password,
        librarySlug: seedB.librarySlug
      }
    });
    tokenB = loginBRes.json().data.accessToken as string;
  });

  afterAll(async () => {
    // Cleanup students
    await db.delete(students).where(eq(students.libraryId, seedA.libraryId));
    await db.delete(students).where(eq(students.libraryId, seedB.libraryId));

    await cleanupAuthTestData(seedA);
    await cleanupAuthTestData(seedB);
    await closeTestResources(app);
  });

  describe('CRUD operations & Validation', () => {
    let studentId: string;

    it('creates a student successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          name: 'Jane Doe',
          phone: '+919999999999',
          email: 'jane@test.local',
          notes: 'Regular student'
        }
      });

      expect(response.statusCode).toBe(201); // Created
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.name).toBe('Jane Doe');
      expect(body.data.phone).toBe('+919999999999');
      expect(body.data.email).toBe('jane@test.local');
      expect(body.data.status).toBe('active');
      expect(body.data.customFields).toEqual({});

      studentId = body.data.id as string;
    });

    it('returns 400 validation error for invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          name: 'Jane Doe',
          phone: '+919999999999',
          email: 'invalid-email'
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 when creating a student with a duplicate phone number', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          name: 'Duplicate Phone Student',
          phone: '+919999999999'
        }
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().error.code).toBe('DUPLICATE_PHONE');
    });

    it('gets a student by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${studentId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.name).toBe('Jane Doe');
    });

    it('updates a student successfully', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/students/${studentId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          name: 'Jane Smith',
          notes: 'Updated notes'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.name).toBe('Jane Smith');
    });

    it('updates a student status successfully', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/students/${studentId}/status`,
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          status: 'suspended'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.status).toBe('suspended');
    });

    it('regenerates QR token successfully', async () => {
      const originalRes = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${studentId}/id-card`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      const originalQr = originalRes.json().data.qrToken as string;

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/students/${studentId}/qr-regenerate`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const newRes = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${studentId}/id-card`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      const newQr = newRes.json().data.qrToken as string;
      expect(newQr).not.toBe(originalQr);
    });

    it('soft deletes a student successfully', async () => {
      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/students/${studentId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(deleteRes.statusCode).toBe(200);

      // Verify they are not returned in normal GET by ID
      const getRes = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${studentId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(getRes.statusCode).toBe(404);

      // Verify they are not in the list query by default
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      const found = listRes.json().data.some((s: { id: string }) => s.id === studentId);
      expect(found).toBe(false);

      // Verify they are in DB but marked as deleted
      const dbRow = await db
        .select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);
      expect(dbRow[0]?.deletedAt).not.toBeNull();
    });
  });

  describe('Multi-tenant isolation', () => {
    let studentBId: string;

    beforeAll(async () => {
      // Create a student in Library B
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenB}`
        },
        payload: {
          name: 'Bob Library B',
          phone: '+918888888888',
          email: 'bob@libraryb.local'
        }
      });
      studentBId = response.json().data.id as string;
    });

    it('denies Library A access to Library B student by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${studentBId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(response.statusCode).toBe(404);
    });

    it('denies Library A updating Library B student', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/students/${studentBId}`,
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: {
          name: 'Hacked name'
        }
      });
      expect(response.statusCode).toBe(404);
    });

    it('does not return Library B student in Library A list/search queries', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students?search=Bob',
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });

      const found = response.json().data.some((s: { id: string }) => s.id === studentBId);
      expect(found).toBe(false);
    });
  });

  describe('Search Priority Logic', () => {
    beforeAll(async () => {
      // Seed some students for search tests
      await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: { name: 'Alice Kumar', phone: '+919111111111' }
      });

      await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: { name: 'Alice Singh', phone: '+919222222222' }
      });

      await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${tokenA}`
        },
        payload: { name: 'Charlie Dev', phone: '+919333333333' }
      });
    });

    it('searches by exact phone number and returns exact match', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students?search=%2B919111111111',
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(response.statusCode).toBe(200);
      const list = response.json().data;
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Alice Kumar');
    });

    it('searches by phone prefix and returns matched list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students?search=%2B919',
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(response.statusCode).toBe(200);
      const list = response.json().data;
      // Should find the 3 seeded +919 students (Alice Kumar, Alice Singh, Charlie Dev)
      expect(list.length).toBeGreaterThanOrEqual(3);
    });

    it('searches by name case-insensitively', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students?search=alice',
        headers: {
          authorization: `Bearer ${tokenA}`
        }
      });
      expect(response.statusCode).toBe(200);
      const list = response.json().data;
      expect(list.length).toBe(2);
      expect(list.map((s: { name: string }) => s.name)).toContain('Alice Kumar');
      expect(list.map((s: { name: string }) => s.name)).toContain('Alice Singh');
    });
  });
});
