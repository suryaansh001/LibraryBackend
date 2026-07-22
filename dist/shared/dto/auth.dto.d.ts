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
export declare function toUserResponseDTO(user: User): UserResponseDTO;
export declare function toLibraryResponseDTO(library: Library): LibraryResponseDTO;
