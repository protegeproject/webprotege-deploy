import { type Page, type Locator, expect } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly heading: Locator;

  /** info.ftl confirmation (shown when SMTP works) */
  readonly confirmationMessage: Locator;
  /** Error banner shown when SMTP is not configured */
  readonly smtpErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.submitButton = page.locator('input[type="submit"]');
    this.backToLoginLink = page.locator('a', { hasText: /back to login/i });
    this.heading = page.locator('h1.wp-heading');
    this.confirmationMessage = page.locator('#kc-info-message .wp-logout-message');
    this.smtpErrorMessage = page.locator('text=Failed to send email');
  }

  async goto() {
    await this.page.goto('/');
    const forgotLink = this.page.locator('a', { hasText: 'Forgot username or password?' });
    await forgotLink.waitFor({ state: 'visible' });
    await forgotLink.click();
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async submitUsername(value: string) {
    await this.usernameInput.fill(value);
    await this.submitButton.click();
  }

  /**
   * After submission, Keycloak either shows:
   * - A confirmation message (info.ftl) when SMTP is configured, or
   * - An SMTP error page when email delivery fails.
   * Both indicate the form was processed successfully.
   */
  async expectFormProcessed() {
    const result = this.page.locator(
      '#kc-info-message .wp-logout-message, :text("Failed to send email"), :text("should receive an email")'
    );
    await result.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectOnForgotPasswordPage() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
