import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 120_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    viewport: { width: 900, height: 720 },
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run start --workspace @satset/blueprint-api',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run start --workspace @satset/blueprint-customer',
      url: 'http://127.0.0.1:3200/customer',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
