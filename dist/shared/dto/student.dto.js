export function toStudentResponseDTO(entity) {
    return {
        id: entity.id,
        name: entity.name,
        phone: entity.phone,
        email: entity.email ?? null,
        photoUrl: entity.photoUrl ?? null,
        status: entity.status,
        seatNumber: entity.seatNumber ?? null,
        membershipType: entity.membershipType ?? null,
        membershipStatus: entity.membershipStatus === 'cancelled' ? null : (entity.membershipStatus ?? null),
        membershipEndDate: entity.membershipEndDate ?? null,
        hoursRemaining: entity.hoursRemaining !== null ? Number(entity.hoursRemaining) : null,
        customFields: entity.customFields,
        createdAt: entity.createdAt.toISOString()
    };
}
export function toStudentListItemDTO(entity) {
    return {
        id: entity.id,
        name: entity.name,
        phone: entity.phone,
        status: entity.status,
        seatNumber: entity.seatNumber ?? null,
        membershipType: entity.membershipType ?? null,
        membershipStatus: entity.membershipStatus === 'cancelled' ? null : (entity.membershipStatus ?? null)
    };
}
export function toStudentIdCardDTO(entity, libraryName) {
    return {
        id: entity.id,
        name: entity.name,
        phone: entity.phone,
        email: entity.email ?? null,
        photoUrl: entity.photoUrl ?? null,
        libraryName,
        qrToken: entity.qrToken,
        seatNumber: entity.seatNumber ?? null,
        membershipType: entity.membershipType ?? null,
        membershipEndDate: entity.membershipEndDate ?? null
    };
}
//# sourceMappingURL=student.dto.js.map