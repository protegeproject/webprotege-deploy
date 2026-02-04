import { type Page, expect } from '@playwright/test';

export class LogoutPage {
  readonly page: Page;

  private readonly keycloakLogoutUrl: string;

  constructor(page: Page) {
    this.page = page;
    const base = process.env.KEYCLOAK_BASE_URL || 'http://webprotege-local.edu/keycloak';
    const realm = process.env.KEYCLOAK_REALM || 'webprotege';
    this.keycloakLogoutUrl = `${base}/realms/${realm}/protocol/openid-connect/logout`;
  }

  async logout() {
    // Navigate to the Keycloak logout endpoint.
    // logout-confirm.ftl auto-submits the form, then info.ftl JS-redirects to '/'.
    await this.page.goto(this.keycloakLogoutUrl);
    // Wait for redirect back to login page
    await this.page.locator('#username').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectLoggedOut() {
    const heading = this.page.locator('h1.wp-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Please sign in to continue');
  }
}
