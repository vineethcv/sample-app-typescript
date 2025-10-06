
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // setupTests lives in the `tests/` folder in this project
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    // look for tests inside both src/ (common) and tests/ (this repo)
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}']
  }
})
