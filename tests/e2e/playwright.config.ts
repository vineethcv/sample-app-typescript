
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry'
  },
  reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'test-results/results.xml' }]
]
});
