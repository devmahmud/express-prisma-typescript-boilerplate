import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentOptions: {
      NODE_ENV: 'test',
    },
    include: ['test/**/*.test.ts'],
    exclude: ['build/**', 'node_modules/**'],
    coverage: {
      include: ['src/**'],
      exclude: ['build/**', 'node_modules/**', 'test/**'],
      reporter: ['text', 'lcov', 'clover', 'html'],
    },
    restoreMocks: true,
    sequence: {
      shuffle: false,
    },
    maxConcurrency: 1, // Run tests sequentially
    isolate: true, // Ensure proper test isolation
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
