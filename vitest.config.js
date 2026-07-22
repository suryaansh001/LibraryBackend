import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts'],
        clearMocks: true,
        restoreMocks: true,
        mockReset: true
    },
    resolve: {
        alias: {
            '@': '/home/suri/proj/library_management/backend/src'
        }
    }
});
//# sourceMappingURL=vitest.config.js.map