import { and, eq, isNull } from 'drizzle-orm';
import { libraryOccupancy } from '../../db/schema/library-occupancy.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { students } from '../../db/schema/students.js';
import { seats } from '../../db/schema/seats.js';
import { memberships } from '../../db/schema/memberships.js';
export class OccupancyService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getLiveOccupancy(libraryId) {
        const [occupancyResult, openSessions] = await Promise.all([
            this.db
                .select({ currentCount: libraryOccupancy.currentCount, capacity: libraryOccupancy.capacity })
                .from(libraryOccupancy)
                .where(eq(libraryOccupancy.libraryId, libraryId))
                .limit(1),
            this.db
                .select({
                id: attendanceSessions.id,
                studentId: attendanceSessions.studentId,
                checkInAt: attendanceSessions.checkInAt,
                seatNumber: seats.seatNumber,
                membershipType: memberships.type,
                studentName: students.name
            })
                .from(attendanceSessions)
                .leftJoin(students, eq(attendanceSessions.studentId, students.id))
                .leftJoin(seats, eq(students.seatId, seats.id))
                .leftJoin(memberships, eq(attendanceSessions.membershipId, memberships.id))
                .where(and(eq(attendanceSessions.libraryId, libraryId), isNull(attendanceSessions.checkOutAt)))
        ]);
        const occupancy = occupancyResult[0];
        const currentCount = occupancy?.currentCount ?? 0;
        const capacity = occupancy?.capacity ?? 100;
        const activeSessions = openSessions.map((session) => ({
            sessionId: session.id,
            studentId: session.studentId,
            studentName: session.studentName ?? 'Unknown',
            seatNumber: session.seatNumber ?? null,
            checkInAt: session.checkInAt.toISOString(),
            membershipType: session.membershipType ?? 'unknown'
        }));
        return {
            currentCount,
            capacity,
            availableFlexible: Math.max(0, capacity - currentCount),
            seats: [],
            activeSessions
        };
    }
}
//# sourceMappingURL=occupancy.service.js.map