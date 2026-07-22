import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { SeatRepository } from './seats.repository.js';
import {
  toSeatResponseDTO,
  toSeatListItemDTO,
  toSeatLiveDTO,
  type SeatResponseDTO,
  type SeatListItemDTO,
  type SeatLiveDTO
} from '../../shared/dto/seat.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type {
  CreateSeatBody,
  UpdateSeatBody,
  UpdateSeatStatusBody,
  SeatListQuery,
  AssignSeatBody
} from './seats.schema.js';

type Database = NodePgDatabase<typeof schema>;

export class SeatService {
  private readonly seatRepository: SeatRepository;

  public constructor(private readonly db: Database) {
    this.seatRepository = new SeatRepository(db);
  }

  public async listSeats(
    query: SeatListQuery,
    libraryId: string
  ): Promise<{ data: SeatListItemDTO[]; total: number }> {
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

  public async getSeatById(seatId: string, libraryId: string): Promise<SeatResponseDTO> {
    const seat = await this.seatRepository.findById(seatId, libraryId);
    if (!seat) {
      throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
    }
    return toSeatResponseDTO(seat);
  }

  public async createSeat(
    body: CreateSeatBody,
    libraryId: string
  ): Promise<SeatResponseDTO> {
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

  public async updateSeat(
    seatId: string,
    body: UpdateSeatBody,
    libraryId: string
  ): Promise<SeatResponseDTO> {
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

  public async updateSeatStatus(
    seatId: string,
    body: UpdateSeatStatusBody,
    libraryId: string
  ): Promise<SeatResponseDTO> {
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

  public async assignSeat(
    seatId: string,
    body: AssignSeatBody,
    libraryId: string
  ): Promise<SeatResponseDTO> {
    const updated = await this.seatRepository.assignStudent(seatId, libraryId, body.studentId);
    if (!updated) {
      throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found or cannot be assigned', 404);
    }
    return toSeatResponseDTO(updated);
  }

  public async unassignSeat(seatId: string, libraryId: string): Promise<void> {
    const updated = await this.seatRepository.unassignStudent(seatId, libraryId);
    if (!updated) {
      throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found or not assigned', 404);
    }
  }

  public async deleteSeat(seatId: string, libraryId: string): Promise<void> {
    const existing = await this.seatRepository.findById(seatId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.SEAT_NOT_FOUND, 'Seat not found', 404);
    }

    await this.seatRepository.delete(seatId, libraryId);
  }

  public async getLiveOccupancy(libraryId: string): Promise<{
    currentCount: number;
    capacity: number;
    availableFlexible: number;
    seats: SeatLiveDTO[];
  }> {
    const result = await this.seatRepository.getLiveOccupancy(libraryId);
    return {
      ...result,
      seats: result.seats.map(toSeatLiveDTO)
    };
  }
}