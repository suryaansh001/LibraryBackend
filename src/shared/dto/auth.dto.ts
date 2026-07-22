import type { Library } from '../../db/schema/libraries.js';
import type { User } from '../../db/schema/users.js';

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: User['role'];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LibraryResponseDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  capacity: number;
  openingTime: string;
  closingTime: string;
  timezone: string;
  subscriptionPlan: Library['subscriptionPlan'];
  subscriptionStatus: Library['subscriptionStatus'];
}

export interface LoginResponseDTO {
  accessToken: string;
  user: UserResponseDTO;
  library: LibraryResponseDTO;
}

export interface MeResponseDTO {
  user: UserResponseDTO;
  library: LibraryResponseDTO;
}

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString()
  };
}

export function toLibraryResponseDTO(library: Library): LibraryResponseDTO {
  return {
    id: library.id,
    name: library.name,
    slug: library.slug,
    logoUrl: library.logoUrl ?? null,
    capacity: library.capacity,
    openingTime: library.openingTime,
    closingTime: library.closingTime,
    timezone: library.timezone,
    subscriptionPlan: library.subscriptionPlan,
    subscriptionStatus: library.subscriptionStatus
  };
}
