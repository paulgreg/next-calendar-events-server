import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [
      // Add Temporal polyfill setup if needed
      path.resolve(__dirname, 'test/setup.js'),
    ],
  },
})
