export function toUserResponseDTO(user) {
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
export function toLibraryResponseDTO(library) {
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
//# sourceMappingURL=auth.dto.js.map