import { test, expect } from '../fixtures/auth.fixture';
import { PRIMARY_TEST_USER } from '../helpers/test-data';

test.describe('Logout', () => {
  test('should logout and land on login page', async ({ loginPage, logoutPage }) => {
    await loginPage.goto();
    await loginPage.login(PRIMARY_TEST_USER.username, PRIMARY_TEST_USER.password);
    await loginPage.page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });

    await logoutPage.logout();
    await logoutPage.expectLoggedOut();
  });

  test('should require re-authentication after logout', async ({ loginPage, logoutPage, page }) => {
    await loginPage.goto();
    await loginPage.login(PRIMARY_TEST_USER.username, PRIMARY_TEST_USER.password);
    await page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });

    await logoutPage.logout();
    await logoutPage.expectLoggedOut();

    // Accessing the app again should redirect to login
    await page.goto('/');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('h1.wp-heading')).toHaveText('Please sign in to continue');
  });
});
