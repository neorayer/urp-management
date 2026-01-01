import { Page, expect } from '@playwright/test';

/**
 * Authentication helper functions for Playwright tests
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Default admin credentials
 */
export const DEFAULT_ADMIN_CREDENTIALS: LoginCredentials = {
  email: 'admin@urp.com',
  password: 'Admin@123',
};

/**
 * Login to the application
 */
export async function login(page: Page, credentials: LoginCredentials = DEFAULT_ADMIN_CREDENTIALS) {
  await page.goto('/login');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/');
  
  // Verify we're logged in by checking for dashboard content
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Click on user avatar dropdown
  await page.click('[data-testid="user-menu"]');
  
  // Click logout button
  await page.click('text=Logout');
  
  // Wait for redirect to login page
  await page.waitForURL('/login');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return !url.includes('/login');
}

/**
 * Navigate to a specific page (assumes user is already logged in)
 */
export async function navigateTo(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(urlPattern);
}

/**
 * Fill form field by label
 */
export async function fillFieldByLabel(page: Page, label: string, value: string) {
  const field = page.locator(`label:has-text("${label}")`).locator('..').locator('input, textarea, select');
  await field.fill(value);
}

/**
 * Click button by text
 */
export async function clickButtonByText(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Wait for toast/notification message
 */
export async function waitForToast(page: Page, message?: string) {
  if (message) {
    await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.locator(selector).count();
  return element > 0;
}

/**
 * Wait for table to load
 */
export async function waitForTable(page: Page) {
  await page.waitForSelector('table', { state: 'visible' });
  await page.waitForLoadState('networkidle');
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  return await page.locator('tbody tr').count();
}

/**
 * Search in table
 */
export async function searchInTable(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  await searchInput.fill(searchTerm);
  await page.waitForTimeout(500); // Debounce wait
}

/**
 * Click on table row action button
 */
export async function clickTableRowAction(page: Page, rowIndex: number, actionText: string) {
  const row = page.locator('tbody tr').nth(rowIndex);
  await row.hover();
  await row.locator(`button:has-text("${actionText}")`).click();
}

/**
 * Open dialog/modal
 */
export async function openDialog(page: Page, triggerText: string) {
  await clickButtonByText(page, triggerText);
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
}

/**
 * Close dialog/modal
 */
export async function closeDialog(page: Page) {
  // Try to find and click close button
  const closeButton = page.locator('[role="dialog"] button:has-text("Cancel"), [role="dialog"] button[aria-label="Close"]').first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

/**
 * Fill dialog form and submit
 */
export async function fillDialogForm(page: Page, formData: Record<string, string>, submitText: string = 'Save') {
  for (const [label, value] of Object.entries(formData)) {
    await fillFieldByLabel(page, label, value);
  }
  await clickButtonByText(page, submitText);
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoading(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for any loading spinners to disappear
  await page.waitForSelector('text=Loading', { state: 'hidden', timeout: 5000 }).catch(() => {});
}
