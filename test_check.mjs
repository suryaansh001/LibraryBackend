import { db } from './src/config/database.js';
import { students } from './src/db/schema/students.js';
import { eq, and, isNull } from 'drizzle-orm';

async function test() {
  const all = await db.select().from(students);
  console.log('All students:', all.length);
  all.forEach(s => console.log(`  ${s.name} - ${s.phone} - library: ${s.libraryId} - deleted: ${s.deletedAt}`));
  
  // Check for duplicates
  const dupes = await db
    .select({ phone: students.phone, libraryId: students.libraryId, count: sql`count(*)` })
    .from(students)
    .where(isNull(students.deletedAt))
    .groupBy(students.phone, students.libraryId)
    .having(sql`count(*) > 1`);
  console.log('Duplicates:', dupes);
}

import { sql } from 'drizzle-orm';
test().catch(console.error);
