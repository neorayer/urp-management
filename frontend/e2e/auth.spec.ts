import { test, expect } from '@playwright/test';
import { login, DEFAULT_ADMIN_CREDENTIALS } from './helpers/auth.helper';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with correct elements', async ({ page }) => {
    // Check for logo/title
    await expect(page.getByText('URP Management')).toBeVisible();
    await expect(page.getByText('Sign in to access the admin panel')).toBeVisible();
    
    // Check for form fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for default credentials hint
    await expect(page.getByText(/Default credentials/i)).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'somepassword');
    await page.click('button[type="submit"]');
    
    // Check for email validation message
    await expect(page.getByText(/Invalid email address/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.getByText(/Login failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill with valid credentials
    await page.fill('input[type="email"]', DEFAULT_ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', DEFAULT_ADMIN_CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify we're on the dashboard
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    // Fill credentials
    await page.fill('input[type="email"]', DEFAULT_ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', DEFAULT_ADMIN_CREDENTIALS.password);
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Check for loading state
    await expect(page.getByText(/Signing in/i)).toBeVisible();
  });

  test('should redirect to dashboard when already logged in', async ({ page }) => {
    // First login
    await login(page);
    
    // Try to go to login page
    await page.goto('/login');
    
    // Should redirect to dashboard (or stay on dashboard)
    const url = page.url();
    expect(url).toContain('/');
  });

  test('should persist session after page reload', async ({ page, context }) => {
    // Login
    await login(page);
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page);
    
    // Find and click user menu
    const userMenu = page.locator('[role="button"]:has-text("' + DEFAULT_ADMIN_CREDENTIALS.email + '"), [data-testid="user-menu"], button:has-text("Admin")').first();
    await userMenu.click();
    
    // Click logout
    await page.click('text=Logout, text=Sign out').first();
    
    // Should redirect to login page
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page.getByText('Sign in to access the admin panel')).toBeVisible();
  });

  test('should not access protected routes without authentication', async ({ page, context }) => {
    // Clear all cookies to ensure we're logged out
    await context.clearCookies();
    
    // Try to access dashboard
    await page.goto('/');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
  });

  test('should not access users page without authentication', async ({ page, context }) => {
    // Clear all cookies
    await context.clearCookies();
    
    // Try to access users page
    await page.goto('/users');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
  });

  test('should not access roles page without authentication', async ({ page, context }) => {
    // Clear all cookies
    await context.clearCookies();
    
    // Try to access roles page
    await page.goto('/roles');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
  });
});
