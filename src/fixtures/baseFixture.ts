import { test as baseTest } from '@playwright/test';
import { NavigationBar } from '../pages/NavigationBar';

type FrameworkFixtures = {
  navBar: NavigationBar;
};

export const test = baseTest.extend<FrameworkFixtures>({
  navBar: async ({ page }, use) => {
    await use(new NavigationBar(page));
  },
});

export { expect } from '@playwright/test';