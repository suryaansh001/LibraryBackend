import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { type SeatResponseDTO, type SeatListItemDTO, type SeatLiveDTO } from '../../shared/dto/seat.dto.js';
import type { CreateSeatBody, UpdateSeatBody, UpdateSeatStatusBody, SeatListQuery, AssignSeatBody } from './seats.schema.js';
type Database = NodePgDatabase<typeof schema>;
export declare class SeatService {
    private readonly db;
    private readonly seatRepository;
    constructor(db: Database);
    listSeats(query: SeatListQuery, libraryId: string): Promise<{
        data: SeatListItemDTO[];
        total: number;
    }>;
    getSeatById(seatId: string, libraryId: string): Promise<SeatResponseDTO>;
    createSeat(body: CreateSeatBody, libraryId: string): Promise<SeatResponseDTO>;
    updateSeat(seatId: string, body: UpdateSeatBody, libraryId: string): Promise<SeatResponseDTO>;
    updateSeatStatus(seatId: string, body: UpdateSeatStatusBody, libraryId: string): Promise<SeatResponseDTO>;
    assignSeat(seatId: string, body: AssignSeatBody, libraryId: string): Promise<SeatResponseDTO>;
    unassignSeat(seatId: string, libraryId: string): Promise<void>;
    deleteSeat(seatId: string, libraryId: string): Promise<void>;
    getLiveOccupancy(libraryId: string): Promise<{
        currentCount: number;
        capacity: number;
        availableFlexible: number;
        seats: SeatLiveDTO[];
    }>;
}
export {};
