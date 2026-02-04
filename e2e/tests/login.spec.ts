import { test, expect } from '../fixtures/auth.fixture';
import { PRIMARY_TEST_USER, INVALID_CREDENTIALS } from '../helpers/test-data';

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display all page elements', async ({ loginPage }) => {
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.heading).toHaveText('Please sign in to continue');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.signUpButton).toBeVisible();
  });

  test('should login successfully with valid username', async ({ loginPage, page }) => {
    await loginPage.login(PRIMARY_TEST_USER.username, PRIMARY_TEST_USER.password);
    // Successful login redirects away from Keycloak
    await page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/keycloak\//);
  });

  test('should login successfully with valid email', async ({ loginPage, page }) => {
    await loginPage.login(PRIMARY_TEST_USER.email, PRIMARY_TEST_USER.password);
    await page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/keycloak\//);
  });

  test('should show error for invalid password', async ({ loginPage }) => {
    await loginPage.login(PRIMARY_TEST_USER.username, INVALID_CREDENTIALS.password);
    await loginPage.expectFieldError(/invalid username or password/i);
  });

  test('should show error for non-existent username', async ({ loginPage }) => {
    await loginPage.login(INVALID_CREDENTIALS.username, INVALID_CREDENTIALS.password);
    await loginPage.expectFieldError(/invalid username or password/i);
  });

  test('should show error when username is empty', async ({ loginPage }) => {
    await loginPage.login('', PRIMARY_TEST_USER.password);
    // Browser validation or Keycloak error
    await loginPage.expectFieldError(/invalid username or password/i);
  });

  test('should show error when password is empty', async ({ loginPage }) => {
    await loginPage.login(PRIMARY_TEST_USER.username, '');
    await loginPage.expectFieldError(/invalid username or password/i);
  });

  test('should show error when both fields are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectFieldError(/invalid username or password/i);
  });

  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page.locator('#username')).toBeVisible();
    // The forgot password page has a submit button but no password field
    await expect(page.locator('#password')).not.toBeVisible();
  });

  test('should navigate to registration page', async ({ loginPage, page }) => {
    await loginPage.signUpButton.click();
    await expect(page.locator('#kc-register-form')).toBeVisible();
  });
});
