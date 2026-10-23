import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['json', { outputFile: 'qa/test-results.json' }]],
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    // Page transitions are also checked in Firefox and WebKit (Safari).
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } }, testMatch: /transitions\.spec\.ts/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } }, testMatch: /transitions\.spec\.ts/ },
  ],
  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
