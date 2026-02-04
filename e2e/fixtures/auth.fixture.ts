import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegistrationPage } from '../pages/registration.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { LogoutPage } from '../pages/logout.page';

type AuthFixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  forgotPasswordPage: ForgotPasswordPage;
  logoutPage: LogoutPage;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
});

export { expect } from '@playwright/test';
