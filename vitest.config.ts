import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@': '/home/suri/proj/library_management/backend/src'
    }
  }
});