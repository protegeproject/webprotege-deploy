import { chromium, type FullConfig } from '@playwright/test';
import { deleteUserByUsername } from './helpers/keycloak-admin';
import { PRIMARY_TEST_USER } from './helpers/test-data';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://webprotege-local.edu';

  console.log('[Global Setup] Cleaning up primary test user if exists...');
  await deleteUserByUsername(PRIMARY_TEST_USER.username);

  console.log('[Global Setup] Registering primary test user via UI...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to base URL (redirects to Keycloak login)
    await page.goto(baseURL);
    await page.locator('#username').waitFor({ state: 'visible' });

    // Click sign up button
    await page.locator('a.wp-signup-btn').click();
    await page.locator('#kc-register-form').waitFor({ state: 'visible' });

    // Fill registration form
    await page.locator('#firstName').fill(PRIMARY_TEST_USER.firstName);
    await page.locator('#lastName').fill(PRIMARY_TEST_USER.lastName);
    await page.locator('#email').fill(PRIMARY_TEST_USER.email);
    await page.locator('#username').fill(PRIMARY_TEST_USER.username);
    await page.locator('#password').fill(PRIMARY_TEST_USER.password);
    await page.locator('#password-confirm').fill(PRIMARY_TEST_USER.password);
    await page.locator('input[type="submit"][value="Register"]').click();

    // Wait for successful registration and redirect to app
    await page.waitForURL((url) => !url.href.includes('/keycloak/'), { timeout: 15_000 });
    console.log('[Global Setup] Primary test user registered successfully.');

    // Logout: navigate to Keycloak logout endpoint
    const keycloakBase = process.env.KEYCLOAK_BASE_URL || 'http://webprotege-local.edu/keycloak';
    const realm = process.env.KEYCLOAK_REALM || 'webprotege';
    const logoutUrl = `${keycloakBase}/realms/${realm}/protocol/openid-connect/logout`;
    await page.goto(logoutUrl);
    // Wait for redirect back to login page
    await page.locator('#username').waitFor({ state: 'visible', timeout: 15_000 });
    console.log('[Global Setup] Logged out after registration.');
  } catch (error) {
    console.error('[Global Setup] Failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
