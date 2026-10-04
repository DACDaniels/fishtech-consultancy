import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const local = '/opt/pw-browsers/chromium';
export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4322',
    launchOptions: existsSync(local) ? { executablePath: local } : {},
  },
  webServer: { command: 'npx astro preview --port 4322', url: 'http://localhost:4322', reuseExistingServer: true, timeout: 60000 },
});
