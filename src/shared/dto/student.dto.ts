import { toISOString } from '../utils/date.util.js';

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

export function toStudentResponseDTO(entity: StudentWithRelations): StudentResponseDTO {
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

export function toStudentListItemDTO(entity: StudentWithRelations): StudentListItemDTO {
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

export function toStudentIdCardDTO(
  entity: StudentWithRelations,
  libraryName: string
): StudentIdCardDTO {
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
