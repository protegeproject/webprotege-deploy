import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpButton: Locator;
  readonly logo: Locator;
  readonly fieldError: Locator;
  readonly alertError: Locator;
  readonly alertSuccess: Locator;
  readonly alertWarning: Locator;
  readonly alertInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1.wp-heading');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#kc-login');
    this.rememberMeCheckbox = page.locator('#rememberMe');
    this.forgotPasswordLink = page.locator('a', { hasText: 'Forgot username or password?' });
    this.signUpButton = page.locator('a.wp-signup-btn');
    this.logo = page.locator('.wp-logo img[alt="WebProtege"]');
    this.fieldError = page.locator('.wp-input-error');
    this.alertError = page.locator('.wp-alert.wp-alert-error');
    this.alertSuccess = page.locator('.wp-alert.wp-alert-success');
    this.alertWarning = page.locator('.wp-alert.wp-alert-warning');
    this.alertInfo = page.locator('.wp-alert.wp-alert-info');
  }

  async goto() {
    await this.page.goto('/');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithRememberMe(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
  }

  async expectFieldError(pattern: RegExp) {
    await expect(this.fieldError).toBeVisible();
    await expect(this.fieldError).toHaveText(pattern);
  }

  async expectAlertError(pattern: RegExp) {
    await expect(this.alertError).toBeVisible();
    await expect(this.alertError).toHaveText(pattern);
  }

  async expectOnLoginPage() {
    await expect(this.heading).toBeVisible();
    await expect(this.heading).toHaveText('Please sign in to continue');
  }
}
