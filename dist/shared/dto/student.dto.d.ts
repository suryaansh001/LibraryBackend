export interface StudentResponseDTO {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    photoUrl: string | null;
    status: 'active' | 'suspended' | 'expired' | 'inactive';
    seatNumber: string | null;
    membershipType: 'monthly' | 'hourly' | null;
    membershipStatus: 'active' | 'expired' | 'suspended' | null;
    membershipEndDate: string | null;
    hoursRemaining: number | null;
    customFields: Record<string, unknown>;
    createdAt: string;
}
export interface StudentListItemDTO {
    id: string;
    name: string;
    phone: string;
    status: string;
    seatNumber: string | null;
    membershipType: string | null;
    membershipStatus: string | null;
}
export interface StudentIdCardDTO {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    photoUrl: string | null;
    libraryName: string;
    qrToken: string;
    seatNumber: string | null;
    membershipType: string | null;
    membershipEndDate: string | null;
}
/** Raw row shape returned from student JOIN queries */
export interface StudentWithRelations {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    photoUrl: string | null;
    status: 'active' | 'suspended' | 'expired' | 'inactive';
    seatNumber: string | null;
    membershipType: 'monthly' | 'hourly' | null;
    membershipStatus: 'active' | 'expired' | 'suspended' | 'cancelled' | null;
    membershipEndDate: string | null;
    hoursRemaining: string | null;
    customFields: Record<string, unknown>;
    createdAt: Date;
    qrToken: string;
}
export declare function toStudentResponseDTO(entity: StudentWithRelations): StudentResponseDTO;
export declare function toStudentListItemDTO(entity: StudentWithRelations): StudentListItemDTO;
export declare function toStudentIdCardDTO(entity: StudentWithRelations, libraryName: string): StudentIdCardDTO;
