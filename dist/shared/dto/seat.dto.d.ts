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
export declare function toSeatResponseDTO(seat: {
    id: string;
    seatNumber: string;
    section: string | null;
    type: 'fixed' | 'flexible';
    status: 'available' | 'occupied' | 'maintenance';
    createdAt: Date;
    updatedAt: Date;
}): SeatResponseDTO;
export declare function toSeatListItemDTO(seat: {
    id: string;
    seatNumber: string;
    section: string | null;
    type: 'fixed' | 'flexible';
    status: 'available' | 'occupied' | 'maintenance';
}): SeatListItemDTO;
export declare function toSeatLiveDTO(seat: {
    seatNumber: string;
    status: 'available' | 'occupied' | 'maintenance';
}): SeatLiveDTO;
