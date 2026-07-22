import { eq, and, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import { students } from '../../db/schema/students.js';
import { seats } from '../../db/schema/seats.js';
import { memberships } from '../../db/schema/memberships.js';
import { generateQrToken } from '../../shared/utils/qr-token.util.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: Record<string, string> }>;
}

export class CsvImportService {
  public async importStudents(
    csvBuffer: Buffer,
    libraryId: string,
    userId: string
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: Record<string, string> }>;
  }> {
    const { parse } = await import('csv-parse/sync');
    const records = parse<Record<string, string>>(csvBuffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const result = { success: 0, failed: 0, errors: [] as Array<{ row: number; error: string; data: Record<string, string> }> };

    for (let i = 0; i < records.length; i++) {
      const row = records[i]!;
      const rowNum = i + 2; // +2 for header and 0-index

      try {
        await this.processStudentRow(row, rowNum, libraryId, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row
        });
      }
    }

    return result;
  }

  private async processStudentRow(
    row: Record<string, string>,
    rowNum: number,
    libraryId: string,
    userId: string
  ): Promise<void> {
    const name = row.name?.trim();
    const phone = row.phone?.trim();
    const email = row.email?.trim() || null;
    const status = (row.status as any) || 'active';
    const seatNumber = row.seat?.trim() || null;

    if (!name || !phone) {
      throw new Error('Name and phone are required');
    }

    // Check if student already exists with this phone
    const existing = await db
      .select()
      .from(students)
      .where(and(eq(students.libraryId, libraryId), eq(students.phone, phone), isNull(students.deletedAt)))
      .limit(1);

    if (existing[0]) {
      throw new Error('Phone number already exists');
    }

    // Check seat if provided
    let seatId: string | null = null;
    if (seatNumber) {
      const seat = await db
        .select()
        .from(seats)
        .where(and(eq(seats.libraryId, libraryId), eq(seats.seatNumber, seatNumber)))
        .limit(1);
      if (seat[0]) {
        seatId = seat[0].id;
        if (seat[0].status === 'occupied') {
          throw new Error(`Seat ${seatNumber} is already occupied`);
        }
      }
    }

    const { generateQrToken } = await import('../../shared/utils/qr-token.util.js');
    const qrToken = generateQrToken(crypto.randomUUID(), libraryId);

    await db.insert(students).values({
      libraryId,
      name,
      phone,
      email,
      status,
      seatId,
      qrToken,
      createdBy: userId
    });
  }
}

export const csvImportService = new CsvImportService();
