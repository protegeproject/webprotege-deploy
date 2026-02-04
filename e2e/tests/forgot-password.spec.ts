import { test, expect } from '../fixtures/auth.fixture';
import { PRIMARY_TEST_USER, INVALID_CREDENTIALS } from '../helpers/test-data';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
  });

  test('should display form correctly', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.expectOnForgotPasswordPage();
    await expect(forgotPasswordPage.heading).toBeVisible();
    await expect(forgotPasswordPage.backToLoginLink).toBeVisible();
  });

  test('should process submission for existing username', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.submitUsername(PRIMARY_TEST_USER.username);
    await forgotPasswordPage.expectFormProcessed();
  });

  test('should process submission for existing email', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.submitUsername(PRIMARY_TEST_USER.email);
    await forgotPasswordPage.expectFormProcessed();
  });

  test('should process submission for non-existent user the same way', async ({ forgotPasswordPage }) => {
    // Keycloak does not reveal whether a user exists (no user enumeration)
    await forgotPasswordPage.submitUsername(INVALID_CREDENTIALS.username);
    await forgotPasswordPage.expectFormProcessed();
  });

  test('should show Back to Login link', async ({ forgotPasswordPage }) => {
    await expect(forgotPasswordPage.backToLoginLink).toBeVisible();
  });

  test('should navigate back to login page via Back to Login link', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.backToLoginLink.click();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#kc-login')).toBeVisible();
  });
});
