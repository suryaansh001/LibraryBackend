import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
export interface LiveOccupancyDTO {
    currentCount: number;
    capacity: number;
    availableFlexible: number;
    seats: Array<{
        seatNumber: string;
        status: 'occupied' | 'available' | 'reserved';
    }>;
    activeSessions: Array<{
        sessionId: string;
        studentId: string;
        studentName: string;
        seatNumber: string | null;
        checkInAt: string;
        membershipType: string;
    }>;
}
export declare class OccupancyService {
    private readonly db;
    constructor(db: NodePgDatabase<typeof schema>);
    getLiveOccupancy(libraryId: string): Promise<{
        currentCount: number;
        capacity: number;
        availableFlexible: number;
        seats: never[];
        activeSessions: {
            sessionId: string;
            studentId: string;
            studentName: string;
            seatNumber: string | null;
            checkInAt: string;
            membershipType: string;
        }[];
    }>;
}
