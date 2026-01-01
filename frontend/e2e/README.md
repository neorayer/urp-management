# Playwright E2E Tests

This directory contains end-to-end tests for the URP Management application using Playwright.

## Prerequisites

Before running the tests, ensure you have:
1. Node.js installed (v18 or later)
2. Backend server running on `http://localhost:8080`
3. Frontend development server running on `http://localhost:5173` (or it will be started automatically)

## Installation

Install Playwright and its dependencies:

```bash
npm install
```

Install Playwright browsers (if not already installed):

```bash
npx playwright install chromium
```

## Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should login successfully"
```

## View Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

## Test Structure

```
e2e/
├── helpers/
│   └── auth.helper.ts        # Authentication and common helper functions
├── auth.spec.ts              # Authentication/login tests
├── dashboard.spec.ts         # Dashboard page tests
├── users.spec.ts             # Users management tests
├── roles.spec.ts             # Roles management tests
├── audit-logs.spec.ts        # Audit logs tests
└── fixtures.ts               # Test fixtures and setup
```

## Test Coverage

The test suite covers:

### Authentication (auth.spec.ts)
- Login page display and validation
- Successful login flow
- Invalid credentials handling
- Session persistence
- Protected route access
- Logout functionality

### Dashboard (dashboard.spec.ts)
- Dashboard layout and statistics
- Recent activity display
- Quick actions navigation
- API error handling
- Loading states

### Users Management (users.spec.ts)
- User listing and table display
- Search and filtering
- User status badges
- Navigation to user details
- Pagination

### Roles Management (roles.spec.ts)
- Role listing in card layout
- Role creation dialog
- Permission counts
- System role badges
- Navigation to role details

### Audit Logs (audit-logs.spec.ts)
- Audit log listing
- Action and target type filtering
- Timestamp formatting
- Actor and target information
- Pagination and export

## Writing New Tests

### Using the authenticated page fixture

Most tests require authentication. Use the `authenticatedPage` fixture:

```typescript
import { test, expect } from './fixtures';

test('my test', async ({ authenticatedPage: page }) => {
  // page is already authenticated
  await page.goto('/some-page');
  // ... your test code
});
```

### Using helper functions

Import and use helper functions for common operations:

```typescript
import { login, logout, navigateTo } from './helpers/auth.helper';

test('my test', async ({ page }) => {
  await login(page);
  await navigateTo(page, '/users');
  // ... your test code
});
```

## Configuration

Test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173`
- **Browser**: Chromium (by default)
- **Retries**: 2 on CI, 0 locally
- **Timeout**: Default Playwright timeout
- **Screenshots**: On failure
- **Traces**: On first retry

## CI/CD Integration

The tests are configured to run in CI environments:

```bash
# In CI
npm run test
```

The configuration automatically:
- Starts the dev server before tests
- Runs tests in parallel (or sequentially on CI)
- Generates HTML reports
- Takes screenshots on failure
- Records traces on retry

## Troubleshooting

### Tests are failing with "Cannot connect to server"
- Ensure the backend server is running on port 8080
- Check that the API endpoints are accessible

### Tests are timing out
- Increase the timeout in `playwright.config.ts`
- Check if the dev server is starting correctly
- Verify network connectivity

### Authentication tests are failing
- Verify the default credentials: `admin@urp.com` / `Admin@123`
- Check if the database is initialized with test data
- Ensure the backend authentication endpoint is working

### Browser not found
- Run `npx playwright install chromium`

## Best Practices

1. **Use Page Object Model**: Consider creating page objects for complex pages
2. **Wait for network idle**: Use `await page.waitForLoadState('networkidle')` when loading data
3. **Use data-testid**: Add `data-testid` attributes to elements for stable selectors
4. **Avoid hard-coded waits**: Use Playwright's auto-waiting features
5. **Clean up**: Tests should not depend on each other's state
6. **Test isolation**: Each test should be independent

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Locators](https://playwright.dev/docs/locators)
