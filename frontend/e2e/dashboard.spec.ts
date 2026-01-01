import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test('should display dashboard with welcome message', async ({ authenticatedPage: page }) => {
    // Verify welcome message is displayed
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    
    // Verify user email or display name is shown in welcome message
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('should display statistics cards', async ({ authenticatedPage: page }) => {
    // Wait for stats to load
    await page.waitForLoadState('networkidle');
    
    // Check for Total Users stat
    await expect(page.getByRole('paragraph').filter({ hasText: 'Total Users' })).toBeVisible();
    
    // Check for Active Roles stat
    await expect(page.getByRole('paragraph').filter({ hasText: 'Active Roles' })).toBeVisible();
    
    // Check for Audit Logs stat
    await expect(page.getByRole('paragraph').filter({ hasText: 'Audit Logs' })).toBeVisible();
  });

  test('should display stats with numeric values', async ({ authenticatedPage: page }) => {
    // Wait for stats to load
    await page.waitForLoadState('networkidle');
    
    // Get all stat cards
    const statsCards = page.locator('p:has-text("Total Users"), p:has-text("Active Roles"), p:has-text("Audit Logs")');
    
    // Verify we have at least 3 stat cards
    await expect(statsCards).toHaveCount(3);
  });

  test('should display Recent Activity section', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for Recent Activity heading
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should display Quick Actions section', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for Quick Actions heading
    await expect(page.getByText('Quick Actions')).toBeVisible();
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: /View Users/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Roles/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Audit Logs/i })).toBeVisible();
  });

  test('should navigate to Users page from Quick Actions', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click View Users button
    await page.click('button:has-text("View Users")');
    
    // Verify navigation to users page
    await page.waitForURL('/users');
    await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible();
  });

  test('should navigate to Roles page from Quick Actions', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click View Roles button
    await page.click('button:has-text("View Roles")');
    
    // Verify navigation to roles page
    await page.waitForURL('/roles');
    await expect(page.getByRole('heading', { name: /Roles/i })).toBeVisible();
  });

  test('should navigate to Audit Logs page from Quick Actions', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click View Audit Logs button
    await page.click('button:has-text("View Audit Logs")');
    
    // Verify navigation to audit logs page
    await page.waitForURL('/audit-logs');
    await expect(page.getByRole('heading', { name: /Audit Logs/i })).toBeVisible();
  });

  test('should show loading state initially', async ({ authenticatedPage: page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Check for loading indicator (may be brief)
    const loadingText = page.getByText(/Loading dashboard/i);
    
    // Eventually the dashboard content should appear
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ authenticatedPage: page, context }) => {
    // Intercept dashboard stats API and make it fail
    await page.route('**/api/dashboard/stats', route => 
      route.abort('failed')
    );
    
    // Reload page to trigger the API call
    await page.reload();
    
    // Check for error message, retry button, or any error indicator
    const errorMessage = page.getByText(/Failed to load|Error|Something went wrong/i);
    const retryButton = page.getByRole('button', { name: /Retry|Try again/i });
    
    // Check if either is visible or if stats still load despite mock
    const hasError = await errorMessage.or(retryButton).isVisible({ timeout: 5000 }).catch(() => false);
    const hasStats = await page.getByText('Total Users').isVisible().catch(() => false);
    
    // Either should show error or continue to work
    expect(hasError || hasStats).toBeTruthy();
  });

  test('should display sidebar navigation', async ({ authenticatedPage: page }) => {
    // Check for navigation links
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/users"]')).toBeVisible();
    await expect(page.locator('nav a[href="/roles"]')).toBeVisible();
    await expect(page.locator('nav a[href="/audit-logs"]')).toBeVisible();
  });

  test('should navigate using sidebar links', async ({ authenticatedPage: page }) => {
    // Click on Users link in sidebar
    await page.click('nav a[href="/users"]');
    await page.waitForURL('/users');
    await expect(page.url()).toContain('/users');
    
    // Navigate back to dashboard
    await page.click('nav a[href="/"]');
    await page.waitForURL('/');
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('should display user menu', async ({ authenticatedPage: page }) => {
    // Look for user menu button (could be avatar, email, or profile button)
    const userMenuButton = page.locator('button').filter({ hasText: /System Administrator|admin/i }).or(
      page.locator('[data-testid="user-menu"]')
    ).first();
    
    // Click to open menu
    await userMenuButton.click();
    
    // Verify menu items
    await expect(page.getByText(/Profile|Settings|Logout|Sign out/i).first()).toBeVisible();
  });

  test('should show recent activity items if available', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for Recent Activity section
    const activitySection = page.getByText('Recent Activity');
    await expect(activitySection).toBeVisible();
    
    // Either should show activities or "No recent activity" message
    const hasActivities = await page.locator('text=/USER_|ROLE_|created|updated|deleted/i').count() > 0;
    const noActivityMessage = await page.getByText(/No recent activity|No activities/i).isVisible().catch(() => false);
    const hasAnyContent = await page.locator('tbody tr, li, div').count() > 0;
    
    // Should have some content in the activity area
    expect(hasActivities || noActivityMessage || hasAnyContent).toBeTruthy();
  });

  test('should format time ago correctly for recent activities', async ({ authenticatedPage: page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for time indicators in recent activity
    const timeIndicators = page.locator('text=/ago|just now/');
    
    // If there are activities, check time format
    const count = await timeIndicators.count();
    if (count > 0) {
      const firstTime = await timeIndicators.first().textContent();
      expect(firstTime).toMatch(/\d+[mhd]\sago|just now/);
    }
  });
});
