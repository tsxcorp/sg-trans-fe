import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.ts/,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3000' },
  projects: [{ name: 'desktop', use: { viewport: { width: 1920, height: 1080 } } }],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000/en',
    timeout: 240_000,
    reuseExistingServer: true,
    env: { CMS_DRIVER: 'fixtures', MAIL_TRANSPORT: 'noop', LEADS_DIR: '/tmp/sg-trans-e2e-leads' },
  },
});
