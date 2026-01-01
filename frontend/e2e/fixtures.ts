import { test as base, expect } from '@playwright/test';
import { login, DEFAULT_ADMIN_CREDENTIALS } from './helpers/auth.helper';

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend({
  /**
   * Authenticated page fixture
   * Automatically logs in before each test
   */
  authenticatedPage: async ({ page }, use) => {
    await login(page, DEFAULT_ADMIN_CREDENTIALS);
    await use(page);
  },
});

export { expect };
