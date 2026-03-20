import { Page, Locator, expect } from '@playwright/test';

export class BikesPage {
  readonly page: Page;
  readonly bikeNav: Locator;
  readonly pageBikes: Locator;
  readonly jobsNav: Locator;
  readonly pageJobs: Locator;
  readonly addBikeMake: Locator;
  readonly addBikeModel: Locator;
  readonly addBikeYear: Locator;
  readonly addBikeButton: Locator;
  readonly addBikeMessage: Locator;
  readonly emptyBikeScreen: Locator;
  readonly bikesList: Locator;
  readonly bikeCount: Locator;
  readonly bikeTag: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bikeNav = page.getByTestId('nav-bikes');
    this.pageBikes = page.getByTestId('page-bikes');
    this.jobsNav = page.getByTestId('nav-jobs');
    this.pageJobs = page.getByTestId('page-jobs');
    this.addBikeMake = page.getByTestId('input-bike-make');
    this.addBikeModel = page.getByTestId('input-bike-model');
    this.addBikeYear = page.getByTestId('input-bike-year');
    this.addBikeButton = page.getByTestId('btn-save-bike');
    this.addBikeMessage = page.getByTestId('message-bike-error');
    this.emptyBikeScreen = page.getByTestId('empty-bikes');
    this.bikesList = page.getByTestId('list-bikes');
    this.bikeCount = page.getByTestId('text-bike-count');
    this.bikeTag = page.getByTestId('bike-tag');
  }

  async addBike({ make, model, year }): Promise<void> {
    await this.addBikeMake.fill(make);
    await this.addBikeModel.fill(model);
    await this.addBikeYear.fill(year);
    await this.submitAddBike();
  }

  async submitAddBike(): Promise<void> {
    await this.addBikeButton.click();
  }

  async expectBikeVisible(name: string): Promise<void> {
    const bike = this.page.getByTestId(/card-bike-/).filter({
      has: this.page.getByTestId('bike-name').filter({ hasText: name }),
    });

    await expect(bike).toHaveCount(1);
  }

  async expectBikeNotVisible(name: string): Promise<void> {
    const bike = this.page.getByTestId(/card-bike-/).filter({
      has: this.page.getByTestId('bike-name').filter({ hasText: name }),
    });

    await expect(bike).toHaveCount(0);
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.addBikeMessage).toContainText(message);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.addBikeMessage).toContainText(message);
  }

  async deleteBikeByName(name: string): Promise<void> {
    const bike = this.page.getByTestId(/card-bike-/).filter({
      has: this.page.getByTestId('bike-name').filter({ hasText: name }),
    });

    await expect(bike).toHaveCount(1);
    await bike.getByTestId('btn-delete-bike').click();
    await expect(bike).toHaveCount(0);
  }

  async gotoBikesPage(): Promise<void> {
    await this.bikeNav.click();
    await expect(this.pageBikes).toBeVisible();
    await expect(this.pageJobs).toBeHidden();
  }
}
