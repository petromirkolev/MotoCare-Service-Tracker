import { Page, Locator, expect } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly pageJobs: Locator;
  readonly pageBikes: Locator;
  readonly jobsNav: Locator;
  readonly jobSelectBike: Locator;
  readonly jobSelectService: Locator;
  readonly jobSelectOdo: Locator;
  readonly jobAddButton: Locator;
  readonly jobAddMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageJobs = page.getByTestId('page-jobs');
    this.pageBikes = page.getByTestId('page-bikes');
    this.jobsNav = page.getByTestId('nav-jobs');
    this.jobSelectBike = page.getByTestId('select-job-bike');
    this.jobSelectService = page.getByTestId('select-job-service-type');
    this.jobSelectOdo = page.getByTestId('input-job-odometer');
    this.jobAddButton = page.getByTestId('btn-create-job');
    this.jobAddMessage = page.getByTestId('message-job-error');
  }

  async gotoJobsPage(): Promise<void> {
    await this.jobsNav.click();
    await expect(this.pageJobs).toBeVisible();
    await expect(this.pageBikes).toBeHidden();
  }

  async addJob(service: string, bike: string, odo: string): Promise<void> {
    await this.jobSelectBike.selectOption(bike);
    await this.jobSelectService.selectOption(service);
    await this.jobSelectOdo.fill(odo);
    await this.jobAddButton.click();
  }

  async expectJobVisible(name: string): Promise<void> {
    const job = this.page.getByTestId(/card-job/).filter({
      has: this.page
        .getByTestId('text-job-service-type')
        .filter({ hasText: name }),
    });

    await expect(job).toHaveCount(1);
  }

  async expectJobNotVisible(name: string): Promise<void> {
    const job = this.page.getByTestId(/card-job/).filter({
      has: this.page
        .getByTestId('text-job-service-type')
        .filter({ hasText: name }),
    });

    await expect(job).toHaveCount(0);
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.jobAddMessage).toContainText(message);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.jobAddMessage).toContainText(message);
  }
}
