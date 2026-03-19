import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly regScreen: Locator;
  readonly goToRegButton: Locator;
  readonly registerEmail: Locator;
  readonly registerPassword: Locator;
  readonly registerConfirmPassword: Locator;
  readonly registerButton: Locator;
  readonly registerMessage: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.regScreen = page.getByTestId('screen-register');
    this.goToRegButton = page.getByTestId('btn-register');
    this.registerEmail = page.getByTestId('register-email');
    this.registerPassword = page.getByTestId('register-password');
    this.registerConfirmPassword = page.getByTestId('register-password2');
    this.registerButton = page.getByTestId('btn-register-submit');
    this.registerMessage = page.getByTestId('reg-hint');
    this.backButton = page.getByTestId('btn-register-back');
  }

  async gotoreg(): Promise<void> {
    await this.page.goto('/');
    await this.goToRegButton.click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.registerEmail.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.registerPassword.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.registerConfirmPassword.fill(password);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async register(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.submit();
  }

  async clickCancel(): Promise<void> {
    await this.backButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.registerMessage).toContainText(message);
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.registerMessage).toContainText(message);
  }
}
