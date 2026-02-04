import { type Page, type Locator, expect } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly form: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly fieldError: Locator;
  readonly alertError: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#kc-register-form');
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#email');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.passwordConfirmInput = page.locator('#password-confirm');
    this.submitButton = page.locator('input[type="submit"][value="Register"]');
    this.backToLoginLink = page.locator('a', { hasText: /back to login/i });
    this.fieldError = page.locator('.pf-c-form__helper-text.pf-m-error, span.field-error, .kc-feedback-text');
    this.alertError = page.locator('.wp-alert.wp-alert-error, .pf-c-alert.pf-m-danger, .alert.alert-error');
    this.heading = page.locator('h1.wp-heading');
  }

  async goto() {
    await this.page.goto('/');
    const signUpButton = this.page.locator('a.wp-signup-btn');
    await signUpButton.waitFor({ state: 'visible' });
    await signUpButton.click();
    await this.form.waitFor({ state: 'visible' });
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    passwordConfirm?: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.usernameInput.fill(data.username);
    await this.passwordInput.fill(data.password);
    await this.passwordConfirmInput.fill(data.passwordConfirm ?? data.password);
    await this.submitButton.click();
  }

  async expectError(pattern: RegExp) {
    const error = this.page.locator(
      '.pf-c-form__helper-text.pf-m-error, span.field-error, .kc-feedback-text, .wp-alert.wp-alert-error, .alert-error, .pf-c-alert__description'
    );
    await expect(error.first()).toBeVisible();
    await expect(error.first()).toHaveText(pattern);
  }

  async expectAnyError() {
    const error = this.page.locator(
      '.pf-c-form__helper-text.pf-m-error, span.field-error, .kc-feedback-text, .wp-alert.wp-alert-error, .alert-error, .pf-c-alert__description'
    );
    await expect(error.first()).toBeVisible();
  }
}
