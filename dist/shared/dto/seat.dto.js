export function toSeatResponseDTO(seat) {
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
export function toSeatListItemDTO(seat) {
    return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        section: seat.section,
        type: seat.type,
        status: seat.status
    };
}
export function toSeatLiveDTO(seat) {
    return {
        seatNumber: seat.seatNumber,
        status: seat.status
    };
}
//# sourceMappingURL=seat.dto.js.map