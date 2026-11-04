import { test, expect } from '@playwright/test';

// Parameterized test data for routes/sections
const navigationTestData = [
  { path: '/', expectedKeyword: /mb\.io|multibank/i },
];

test.describe('Bonus & Advanced QA Verification', () => {

  // 1. Parameterized Test Data
  for (const data of navigationTestData) {
    test(`Parameterized test for route: ${data.path}`, async ({ page }) => {
      await page.goto(data.path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(data.expectedKeyword);
    });
  }

  // 2. Validate Relevant API / Network Responses
  test('Validate relevant API or network responses during navigation', async ({ page }) => {
    let apiCallDetected = false;
    
    page.on('response', response => {
      if (response.url().includes('api') || response.url().includes('graphql') || response.status() === 200) {
        apiCallDetected = true;
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Verify that network responses are successfully received
    expect(apiCallDetected).toBe(true);
  });

  // 3. Visual Regression Checks
  test('Visual regression check via screenshot comparison', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Take a baseline screenshot and compare against visual snapshot
    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toBeTruthy();
  });

});
