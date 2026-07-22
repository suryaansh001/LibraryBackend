export interface SeatResponseDTO {
  id: string;
  seatNumber: string;
  section: string | null;
  type: 'fixed' | 'flexible';
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface SeatListItemDTO {
  id: string;
  seatNumber: string;
  section: string | null;
  type: 'fixed' | 'flexible';
  status: 'available' | 'occupied' | 'maintenance';
}

export interface SeatLiveDTO {
  seatNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export function toSeatResponseDTO(seat: {
  id: string;
  seatNumber: string;
  section: string | null;
  type: 'fixed' | 'flexible';
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}): SeatResponseDTO {
  return {
    id: seat.id,
    seatNumber: seat.seatNumber,
    section: seat.section,
    type: seat.type,
    status: seat.status,
    createdAt: seat.createdAt.toISOString(),
    updatedAt: seat.updatedAt.toISOString()
  };
}

export function toSeatListItemDTO(seat: {
  id: string;
  seatNumber: string;
  section: string | null;
  type: 'fixed' | 'flexible';
  status: 'available' | 'occupied' | 'maintenance';
}): SeatListItemDTO {
  return {
    id: seat.id,
    seatNumber: seat.seatNumber,
    section: seat.section,
    type: seat.type,
    status: seat.status
  };
}

export function toSeatLiveDTO(seat: {
  seatNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
}): SeatLiveDTO {
  return {
    seatNumber: seat.seatNumber,
    status: seat.status
  };
}