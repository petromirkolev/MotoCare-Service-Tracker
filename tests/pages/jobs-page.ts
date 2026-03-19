import { Page, Locator, expect } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly pageJobs: Locator;
  readonly jobsNav: Locator;
  readonly jobSelectBike: Locator;
  readonly jobSelectService: Locator;
  readonly jobSelectOdo: Locator;
  readonly jobAddButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageJobs = page.getByTestId('page-jobs');
    this.jobsNav = page.getByTestId('nav-jobs');
    this.jobSelectBike = page.getByTestId('select-job-bike');
    this.jobSelectService = page.getByTestId('select-job-service-type');
    this.jobSelectOdo = page.getByTestId('input-job-odometer');
    this.jobAddButton = page.getByTestId('btn-create-job');
  }

  async addJob(
    service: string,
    make: string,
    model: string,
    odo: string,
  ): Promise<void> {
    await this.jobSelectBike.selectOption(`${make} ${model}`);
    await this.jobSelectService.selectOption({ label: service });
    await this.jobSelectOdo.fill(odo);
    await this.jobAddButton.click();
  }
}
