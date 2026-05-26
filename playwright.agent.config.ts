import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.EXPO_WEB_PORT ?? 8081);
const baseURL = process.env.EXPO_WEB_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e/playwright',
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  outputDir: './test-results/agent-web',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/agent-web', open: 'never' }],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: `pnpm exec expo start --web --localhost --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
