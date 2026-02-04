import { test, expect } from '../fixtures/auth.fixture';
import { PRIMARY_TEST_USER, createUniqueTestUser } from '../helpers/test-data';
import { deleteUserByUsername } from '../helpers/keycloak-admin';

test.describe('Sign Up / Registration', () => {
  test('should register a new user successfully', async ({ registrationPage, page }) => {
    const newUser = createUniqueTestUser('signup');

    await registrationPage.goto();
    await registrationPage.register(newUser);

    // Successful registration auto-logs in and redirects to app
    await page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/keycloak\//);

    // Clean up: delete the user we just created
    await deleteUserByUsername(newUser.username);
  });

  test('should show error for duplicate username', async ({ registrationPage }) => {
    const dupUser = createUniqueTestUser('dupuser');
    dupUser.username = PRIMARY_TEST_USER.username;
    // Use a different email so only username conflicts
    dupUser.email = `wp_test_dup_username_${Date.now()}@example.com`;

    await registrationPage.goto();
    await registrationPage.register(dupUser);

    await registrationPage.expectAnyError();
  });

  test('should show error for duplicate email', async ({ registrationPage }) => {
    const dupUser = createUniqueTestUser('dupemail');
    dupUser.email = PRIMARY_TEST_USER.email;
    // Use a different username so only email conflicts
    dupUser.username = `wp_test_dup_email_${Date.now()}`;

    await registrationPage.goto();
    await registrationPage.register(dupUser);

    await registrationPage.expectAnyError();
  });

  test('should show error for password mismatch', async ({ registrationPage }) => {
    const user = createUniqueTestUser('pwmismatch');

    await registrationPage.goto();
    await registrationPage.register({
      ...user,
      passwordConfirm: 'DifferentPassword456!',
    });

    await registrationPage.expectAnyError();
  });

  test('should show error when all fields are empty', async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.register({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
    });

    await registrationPage.expectAnyError();
  });

  test('should show error when username is empty', async ({ registrationPage }) => {
    const user = createUniqueTestUser('nousername');

    await registrationPage.goto();
    await registrationPage.register({
      ...user,
      username: '',
    });

    await registrationPage.expectAnyError();
  });

  test('should show error when email is empty', async ({ registrationPage }) => {
    const user = createUniqueTestUser('noemail');

    await registrationPage.goto();
    await registrationPage.register({
      ...user,
      email: '',
    });

    await registrationPage.expectAnyError();
  });

  test('should navigate back to login page', async ({ registrationPage, page }) => {
    await registrationPage.goto();
    await registrationPage.backToLoginLink.click();

    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#kc-login')).toBeVisible();
  });
});
