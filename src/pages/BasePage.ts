import { Page, Locator, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(path: string = ''): Promise<void> {
    await allure.step(`Navigate to "${path}"`, async () => {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    });
  }

  async waitForElementVisible(locator: Locator, timeout: number = 12000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async safeClick(locator: Locator, stepName?: string): Promise<void> {
    await allure.step(stepName || 'Click element', async () => {
      await this.waitForElementVisible(locator);
      await locator.click();
    });
  }
}