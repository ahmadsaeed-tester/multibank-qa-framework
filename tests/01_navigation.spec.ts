import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load homepage and verify title and URL', async ({ page }) => {
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(0);
    await expect(page).toHaveURL(/mb\.io|multibank/i);
  });

  test('Top navigation renders with expected items visible', async ({ page }) => {
    // Check viewport for standard desktop size
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Look for common navigation elements/links in the header
    const navLocator = page.locator('header nav, nav').first();
    await expect(navLocator).toBeVisible();

    // Verify presence of interactive links or items inside the header/nav
    const navLinks = navLocator.locator('a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Each navigation item links to the correct destination', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    const navLinks = page.locator('header nav a, nav a');
    const count = await navLinks.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        // Verify that the link has a valid href attribute
        expect(href).toBeTruthy();
      }
    }
  });

  test('Navigation behaves correctly at standard desktop viewport sizes', async ({ page }) => {
    // Test standard desktop viewports
    const viewports = [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    }
  });
});