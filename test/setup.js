// Setup file for Vitest
// Import Temporal polyfill to ensure it's available in tests
import { Temporal } from '@js-temporal/polyfill'

// Make Temporal available globally for tests
globalThis.Temporal = Temporal
