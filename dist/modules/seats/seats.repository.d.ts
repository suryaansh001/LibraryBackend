import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { seats } from '../../db/schema/seats.js';
type Database = NodePgDatabase<typeof schema>;
export interface SeatListParams {
    libraryId: string;
    status?: 'available' | 'occupied' | 'maintenance';
    type?: 'fixed' | 'flexible';
    search?: string;
    offset: number;
    limit: number;
}
export interface SeatListResult {
    seats: (typeof seats.$inferSelect)[];
    total: number;
}
export declare class SeatRepository {
    private readonly db;
    constructor(db: Database);
    findById(seatId: string, libraryId: string): Promise<typeof seats.$inferSelect | null>;
    findBySeatNumber(seatNumber: string, libraryId: string): Promise<typeof seats.$inferSelect | null>;
    list(params: SeatListParams): Promise<SeatListResult>;
    create(input: {
        libraryId: string;
        seatNumber: string;
        section: string | null;
        type: 'fixed' | 'flexible';
    }, tx?: Database): Promise<typeof seats.$inferSelect>;
    update(seatId: string, libraryId: string, data: {
        seatNumber?: string;
        section?: string | null;
        type?: 'fixed' | 'flexible';
    }, tx?: Database): Promise<typeof seats.$inferSelect | null>;
    updateStatus(seatId: string, libraryId: string, status: 'available' | 'occupied' | 'maintenance', tx?: Database): Promise<typeof seats.$inferSelect | null>;
    assignStudent(seatId: string, libraryId: string, studentId: string, tx?: Database): Promise<typeof seats.$inferSelect | null>;
    unassignStudent(seatId: string, libraryId: string, tx?: Database): Promise<typeof seats.$inferSelect | null>;
    delete(seatId: string, libraryId: string, tx?: Database): Promise<void>;
    getLiveOccupancy(libraryId: string): Promise<{
        currentCount: number;
        capacity: number;
        availableFlexible: number;
        seats: Array<{
            seatNumber: string;
            status: 'available' | 'occupied' | 'maintenance';
        }>;
    }>;
}
export {};
