import { defineConfig } from 'vitest/config'

export default defineConfig(() => {
    return {
        test: {
            include: ['**/*.test.js'],
            globals: true,
        },
    }
})
