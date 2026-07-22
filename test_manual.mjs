import { db } from './src/config/database.js';
import { students } from './src/db/schema/students.js';
import { generateQrToken } from './src/shared/utils/qr-token.util.js';
import crypto from 'node:crypto';

async function test() {
  const libraryId = '00000000-0000-0000-0000-000000000001'; // fake
  const studentId = crypto.randomUUID();
  const qrToken = generateQrToken(studentId, libraryId);
  
  console.log('Attempting direct insert...');
  
  try {
    const result = await db.insert(students).values({
      id: studentId,
      libraryId,
      name: 'Test Student',
      phone: '+919999999999',
      qrToken,
      status: 'active',
      createdBy: null,
    }).returning();
    
    console.log('Insert successful:', result);
  } catch (e) {
    console.error('Insert failed:', e);
  }
  
  // Check if it's there
  const check = await db.select().from(students).where(eq(students.phone, '+919999999999'));
  console.log('Students with that phone:', check.length);
}

import { eq } from 'drizzle-orm';
test().catch(console.error);
