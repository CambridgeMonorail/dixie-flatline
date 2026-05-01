import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/project-memory-extension/src/**/*.spec.ts']
  }
});
