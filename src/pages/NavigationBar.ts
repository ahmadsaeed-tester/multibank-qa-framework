import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import * as allure from 'allure-js-commons';

export interface NavLinkItem {
  label: string;
  expectedPath: string;
}

export class NavigationBar extends BasePage {
  readonly headerContainer: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.headerContainer = page.locator('header, nav[role="navigation"]').first();
    this.logo = this.headerContainer.locator('a[href="/"], svg, img[alt*="logo" i]').first();
    this.navLinks = this.headerContainer.locator('a');
    this.mobileMenuButton = page.locator('button[aria-label*="menu" i], [data-testid="mobile-menu-btn"], svg[class*="menu" i]').first();
  }

  async verifyHeaderAndLogoVisible(): Promise<void> {
    await allure.step('Verify header container and logo are visible', async () => {
      await this.waitForElementVisible(this.headerContainer);
      await this.waitForElementVisible(this.logo);
    });
  }

  async verifyNavItemsVisible(expectedItems: NavLinkItem[]): Promise<void> {
    for (const item of expectedItems) {
      await allure.step(`Verify nav item "${item.label}" is visible`, async () => {
        const link = this.headerContainer.getByRole('link', { name: new RegExp(item.label, 'i') }).first();
        await expect(link, `Navigation link for ${item.label} should be visible`).toBeVisible();
      });
    }
  }

  async verifyNavItemLinksToDestination(item: NavLinkItem): Promise<void> {
    await allure.step(`Verify nav item "${item.label}" href contains "${item.expectedPath}"`, async () => {
      const link = this.headerContainer.getByRole('link', { name: new RegExp(item.label, 'i') }).first();
      const href = await link.getAttribute('href');
      expect(href, `Expected link for "${item.label}" to point to "${item.expectedPath}"`).toContain(item.expectedPath);
    });
  }

  async clickNavItemAndAssertURL(item: NavLinkItem): Promise<void> {
    await allure.step(`Click "${item.label}" and assert URL matches "${item.expectedPath}"`, async () => {
      const link = this.headerContainer.getByRole('link', { name: new RegExp(item.label, 'i') }).first();
      await link.click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.page).toHaveURL(new RegExp(item.expectedPath));
    });
  }

  async verifyDesktopLayoutIntegrity(viewport: { width: number; height: number }): Promise<void> {
    await allure.step(`Validate desktop layout integrity at ${viewport.width}x${viewport.height}`, async () => {
      await this.page.setViewportSize(viewport);
      await this.waitForElementVisible(this.headerContainer);

      const isMobileMenuVisible = await this.mobileMenuButton.isVisible().catch(() => false);
      expect(isMobileMenuVisible, `Mobile hamburger button should remain hidden at ${viewport.width}px`).toBeFalsy();

      const headerBox = await this.headerContainer.boundingBox();
      expect(headerBox, 'Header bounding box should exist').not.toBeNull();
      if (headerBox) {
        expect(headerBox.width).toBeGreaterThanOrEqual(viewport.width * 0.95);
      }
    });
  }
}