import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginScreen: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly loginMessage: Locator;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async fillEmail(email: string): Promise<void> {
    await this.loginEmail.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.loginPassword.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.loginMessage).toContainText(message);
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.loginMessage).toContainText(message);
  }
}
