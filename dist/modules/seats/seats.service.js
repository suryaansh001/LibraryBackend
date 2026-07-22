import { SeatRepository } from './seats.repository.js';
import { toSeatResponseDTO, toSeatListItemDTO, toSeatLiveDTO } from '../../shared/dto/seat.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
export class SeatService {
    db;
    seatRepository;
    constructor(db) {
        this.db = db;
        this.seatRepository = new SeatRepository(db);
    }
    async listSeats(query, libraryId) {
        const offset = (query.page - 1) * query.limit;
        const result = await this.seatRepository.list({
            libraryId,
            status: query.status,
            type: query.type,
            search: query.search,
            offset,
            limit: query.limit
        });
        return {
            data: result.seats.map(toSeatListItemDTO),
            total: result.total
        };
    }
    async getSeatById(seatId, libraryId) {
        const seat = await this.seatRepository.findById(seatId, libraryId);
        if (!seat) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
        }
        return toSeatResponseDTO(seat);
    }
    async createSeat(body, libraryId) {
        const existing = await this.seatRepository.findBySeatNumber(body.seatNumber, libraryId);
        if (existing) {
            throw new AppError(ERROR_CODES.SEAT_NUMBER_EXISTS, 'Seat number already exists in this library', 409);
        }
        const seat = await this.seatRepository.create({
            libraryId,
            seatNumber: body.seatNumber,
            section: body.section ?? null,
            type: body.type
        });
        return toSeatResponseDTO(seat);
    }
    async updateSeat(seatId, body, libraryId) {
        const existing = await this.seatRepository.findById(seatId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
        }
        if (body.seatNumber && body.seatNumber !== existing.seatNumber) {
            const duplicate = await this.seatRepository.findBySeatNumber(body.seatNumber, libraryId);
            if (duplicate) {
                throw new AppError(ERROR_CODES.SEAT_NUMBER_EXISTS, 'Seat number already exists in this library', 409);
            }
        }
        const updated = await this.seatRepository.update(seatId, libraryId, body);
        if (!updated) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found after update', 404);
        }
        return toSeatResponseDTO(updated);
    }
    async updateSeatStatus(seatId, body, libraryId) {
        const existing = await this.seatRepository.findById(seatId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
        }
        const updated = await this.seatRepository.updateStatus(seatId, libraryId, body.status);
        if (!updated) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found after status update', 404);
        }
        return toSeatResponseDTO(updated);
    }
    async assignSeat(seatId, body, libraryId) {
        const updated = await this.seatRepository.assignStudent(seatId, libraryId, body.studentId);
        if (!updated) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found or cannot be assigned', 404);
        }
        return toSeatResponseDTO(updated);
    }
    async unassignSeat(seatId, libraryId) {
        const updated = await this.seatRepository.unassignStudent(seatId, libraryId);
        if (!updated) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found or not assigned', 404);
        }
    }
    async deleteSeat(seatId, libraryId) {
        const existing = await this.seatRepository.findById(seatId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
        }
        await this.seatRepository.delete(seatId, libraryId);
    }
    async getLiveOccupancy(libraryId) {
        const result = await this.seatRepository.getLiveOccupancy(libraryId);
        return {
            ...result,
            seats: result.seats.map(toSeatLiveDTO)
        };
    }
}
//# sourceMappingURL=seats.service.js.map