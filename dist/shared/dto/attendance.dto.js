export const CheckInMethod = ['qr', 'manual'];
export const CheckOutMethod = ['qr', 'manual', 'auto', 'forgot'];
export function toCheckInResponseDTO(session, occupancy) {
    return {
        sessionId: session.id,
        studentName: session.studentName ?? '',
        seatNumber: session.seatNumber,
        membershipType: session.membershipType ?? '',
        checkInAt: session.checkInAt.toISOString(),
        currentOccupancy: occupancy.currentCount
    };
}
export function toAttendanceSessionDTO(session) {
    return {
        id: session.id,
        studentId: session.studentId,
        studentName: session.studentName ?? '',
        seatNumber: session.seatNumber ?? null,
        checkInAt: session.checkInAt.toISOString(),
        checkOutAt: session.checkOutAt?.toISOString() ?? null,
        durationMinutes: session.durationMinutes ?? null,
        checkInMethod: session.checkInMethod,
        checkOutMethod: session.checkOutMethod,
        isManualCorrection: session.isManualCorrection ?? false
    };
}
//# sourceMappingURL=attendance.dto.js.map