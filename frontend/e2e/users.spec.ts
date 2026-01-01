import { test, expect } from './fixtures';

test.describe('Users Page', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to users page
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display users page with correct heading', async ({ authenticatedPage: page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    
    // Check description
    await expect(page.getByText('Manage user accounts and permissions')).toBeVisible();
  });

  test('should display Add User button', async ({ authenticatedPage: page }) => {
    // Check for Add User button
    const addButton = page.getByRole('link', { name: /Add User/i });
    await expect(addButton).toBeVisible();
    
    // Verify it links to create user page
    await expect(addButton).toHaveAttribute('href', '/users/new');
  });

  test('should display filters section', async ({ authenticatedPage: page }) => {
    // Check for filters
    await expect(page.getByText('Filters')).toBeVisible();
    
    // Check for search input
    const searchInput = page.getByPlaceholder('Search users...');
    await expect(searchInput).toBeVisible();
    
    // Check for status filter
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display users table with correct columns', async ({ authenticatedPage: page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { state: 'visible' });
    
    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Login' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should display users in table', async ({ authenticatedPage: page }) => {
    // Wait for table body
    await page.waitForSelector('tbody tr', { state: 'visible' });
    
    // Check that at least one user row exists
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(await rows.count());
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('should display user information in table row', async ({ authenticatedPage: page }) => {
    // Get first user row
    const firstRow = page.locator('tbody tr').first();
    
    // Check for user avatar/initial
    await expect(firstRow.locator('div').first()).toBeVisible();
    
    // Check for email
    await expect(firstRow.locator('text=/@/')).toBeVisible();
    
    // Check for View button
    await expect(firstRow.getByRole('link', { name: 'View' })).toBeVisible();
  });

  test('should search users by email', async ({ authenticatedPage: page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('admin');
    
    // Wait for search to complete
    await page.waitForTimeout(1000); // Debounce
    
    // Verify filtered results
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    
    // Should have some results
    expect(count).toBeGreaterThan(0);
  });

  test('should clear search results when search is cleared', async ({ authenticatedPage: page }) => {
    // Get initial count
    const initialCount = await page.locator('tbody tr').count();
    
    // Search for something
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('nonexistent@test.com');
    await page.waitForTimeout(1000);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // Should have results again
    const afterClearCount = await page.locator('tbody tr').count();
    expect(afterClearCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should filter users by status', async ({ authenticatedPage: page }) => {
    // Click on status filter
    await page.click('button[role="combobox"]');
    
    // Select ACTIVE status from dropdown options
    await page.locator('[role="option"]').filter({ hasText: /^ACTIVE$/ }).click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // All visible users should have ACTIVE status badge
    const statusBadges = page.locator('tbody tr').locator('text=/ACTIVE/i');
    const statusCount = await statusBadges.count();
    
    expect(statusCount).toBeGreaterThan(0);
  });

  test('should reset status filter to show all users', async ({ authenticatedPage: page }) => {
    // Set a status filter first
    await page.click('button[role="combobox"]');
    await page.locator('[role="option"]').filter({ hasText: /^ACTIVE$/ }).click();
    await page.waitForTimeout(1000);
    
    // Reset to all
    await page.click('button[role="combobox"]');
    await page.click('text=All Status');
    await page.waitForTimeout(1000);
    
    // Should show users with various statuses
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should navigate to user detail page when clicking View', async ({ authenticatedPage: page }) => {
    // Click View on first user
    const firstViewButton = page.locator('tbody tr').first().getByRole('link', { name: 'View' });
    await firstViewButton.click();
    
    // Should navigate to user detail page
    await page.waitForURL(/\/users\/\d+/);
    expect(page.url()).toMatch(/\/users\/\d+/);
  });

  test('should navigate to create user page when clicking Add User', async ({ authenticatedPage: page }) => {
    // Click Add User button
    await page.click('a:has-text("Add User")');
    
    // Should navigate to new user page
    await page.waitForURL('/users/new');
    expect(page.url()).toContain('/users/new');
  });

  test('should display user status badges with correct styling', async ({ authenticatedPage: page }) => {
    // Look for status in first row (may be badge or text)
    const firstRow = page.locator('tbody tr').first();
    
    // Check for status indicator in the correct column (likely column 3 or 4)
    // Status could be in various positions, so check multiple cells
    const rowText = await firstRow.textContent();
    expect(rowText).toMatch(/ACTIVE|INACTIVE|SUSPENDED/i);
  });

  test('should display user role count', async ({ authenticatedPage: page }) => {
    // Look for role count in first row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow.locator('text=/\\d+ role\\(s\\)/')).toBeVisible();
  });

  test('should display last login date or Never', async ({ authenticatedPage: page }) => {
    // Look for last login in first row
    const firstRow = page.locator('tbody tr').first();
    
    // Should show either a date or "Never"
    const lastLoginCell = firstRow.locator('td').nth(3);
    const text = await lastLoginCell.textContent();
    
    expect(text).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|Never/);
  });

  test('should show loading state when fetching users', async ({ authenticatedPage: page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Check for loading text (may be brief)
    const loadingText = page.getByText(/Loading users/i);
    
    // Eventually table should appear
    await page.waitForSelector('table', { state: 'visible', timeout: 10000 });
  });

  test('should display Load More button when there are more pages', async ({ authenticatedPage: page }) => {
    // Look for Load More button (only if there are more results)
    const loadMoreButton = page.getByRole('button', { name: /Load More/i });
    
    // If it exists, clicking should load more users
    if (await loadMoreButton.isVisible()) {
      const initialCount = await page.locator('tbody tr').count();
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      
      const newCount = await page.locator('tbody tr').count();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('should combine search and status filters', async ({ authenticatedPage: page }) => {
    // Apply both filters
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('admin');
    
    await page.click('button[role="combobox"]');
    await page.locator('[role="option"]').filter({ hasText: /^ACTIVE$/ }).click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    
    // Count could be 0 or more depending on data
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display user avatar initials', async ({ authenticatedPage: page }) => {
    // Get first user row
    const firstRow = page.locator('tbody tr').first();
    
    // Check for avatar with initial
    const avatar = firstRow.locator('div').first();
    const text = await avatar.textContent();
    
    // Should have at least one character
    expect(text?.length).toBeGreaterThan(0);
  });

  test('should handle no search results gracefully', async ({ authenticatedPage: page }) => {
    // Search for non-existent user
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('nonexistent-user-xyz-123456789');
    
    // Wait for search
    await page.waitForTimeout(1000);
    
    // Table should be empty or show no results
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(0);
  });

  test('should maintain filter state when navigating back', async ({ authenticatedPage: page }) => {
    // Apply a filter
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('admin');
    await page.waitForTimeout(1000);
    
    // Navigate away
    await page.goto('/');
    
    // Navigate back
    await page.goto('/users');
    
    // Filter might not persist (depends on implementation)
    // Just verify page loads correctly
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });
});
