export const authPlugin = async (fastify) => {
    // Auth utilities are now imported directly from @/shared/utils/auth.util.js
    // This plugin is kept for future extensibility (e.g., custom auth hooks)
    fastify.log.debug('Auth plugin registered (no-op)');
};
//# sourceMappingURL=auth.plugin.js.map