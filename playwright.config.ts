import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true }]
  ],
  use: {
    baseURL: 'https://multibank.io/',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'Desktop-Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop-Edge',
      use: { ...devices['Desktop Chrome'], channel: 'msedge', viewport: { width: 1440, height: 900 } },
    }
  ],
});