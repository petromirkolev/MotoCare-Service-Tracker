import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RegisterPage } from '../pages/register-page';
import { validInput, uniqueEmail } from '../utils/test-data';
import { BikesPage } from '../pages/bikes-page';
import { JobsPage } from '../pages/jobs-page';

function seededBike() {
  const suffix = Date.now().toString();
  return {
    make: `Yamaha-${suffix}`,
    model: `Tracer-9GT-${suffix}`,
    year: '2021',
  };
}

test.describe('Bikes test suite', () => {
  let loginPage: LoginPage;
  let bikePage: BikesPage;
  let registerPage: RegisterPage;
  let jobsPage: JobsPage;
  let email: string;
  let password: string;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bikePage = new BikesPage(page);
    registerPage = new RegisterPage(page);
    jobsPage = new JobsPage(page);

    email = uniqueEmail('login-seeded');
    password = validInput.password;

    await registerPage.gotoreg();
    await registerPage.register(email, password);
    await registerPage.expectSuccess('Registration successful!');

    await loginPage.goto();
    await loginPage.login(email, password);
  });

  test('User can add bike successfully', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);
  });

  test('Bike persists after page refresh', async ({ page }) => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await page.reload();

    await bikePage.expectBikeVisible(bike.make);
  });

  test('Bike count updates after adding a bike', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);
    await expect(bikePage.bikeCount).toHaveText('1 motorcycle');
  });

  test('Add bike with empty make is rejected', async () => {
    await bikePage.addBike({
      make: '',
      model: 'Tracer 9GT',
      year: '2021',
    });

    await bikePage.expectError('Make is required');
  });

  test('Add bike with empty model is rejected', async () => {
    await bikePage.addBike({
      make: 'Yamaha',
      model: '',
      year: '2021',
    });

    await bikePage.expectError('Model is required');
  });

  test('Add bike with empty year is rejected', async () => {
    await bikePage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '',
    });

    await bikePage.expectError('Invalid year');
  });

  test('Add bike with year below allowed range is rejected', async () => {
    await bikePage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '1899',
    });

    await bikePage.expectError('Invalid year');
  });

  test('Add bike with year above allowed range is rejected', async () => {
    await bikePage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '2101',
    });

    await bikePage.expectError('Invalid year');
  });

  test('User can delete bike successfully', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await bikePage.deleteBikeByName(bike.make);

    await bikePage.expectBikeNotVisible(bike.make);
  });

  test('Bike delete persists after refresh', async ({ page }) => {
    const bike = seededBike();

    await bikePage.addBike(bike);

    await bikePage.deleteBikeByName(bike.make);
    await bikePage.expectBikeNotVisible(bike.make);

    await page.reload();

    await bikePage.expectBikeNotVisible(bike.make);
  });

  test('Empty state is shown when user has no added bikes', async () => {
    await expect(bikePage.emptyBikeScreen).toBeVisible();
    await expect(bikePage.bikesList).toBeHidden();
  });

  test('Empty state is not shown after adding first bike', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await expect(bikePage.bikesList).toBeVisible();
    await expect(bikePage.emptyBikeScreen).toBeHidden();
  });

  test('User sees his own bikes only', async ({ page }) => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await page.getByTestId('btn-logout-topbar').click();

    await registerPage.gotoreg();

    const email = uniqueEmail();
    const password = validInput.password;

    await registerPage.register(email, password);
    await registerPage.expectSuccess('Registration successful!');

    await loginPage.goto();
    await loginPage.login(email, password);

    await bikePage.expectBikeNotVisible(bike.make);
  });

  test('Bike shows "Ready" when it has no open jobs', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await expect(bikePage.bikeTag).toHaveText('Ready');
  });

  test('Bike shows "Not ready" when it has open jobs', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await expect(bikePage.bikeTag).toHaveText('Ready');

    await bikePage.gotoJobsPage();

    await jobsPage.addJob('Oil Change', bike.make, bike.model, '20000');

    await bikePage.gotoBikesPage();

    await expect(bikePage.bikeTag).toHaveText('Not ready');
  });

  test('Bike shows "Ready" when open job is done', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await expect(bikePage.bikeTag).toHaveText('Ready');

    await bikePage.gotoJobsPage();

    await jobsPage.addJob('Oil Change', bike.make, bike.model, '20000');

    await bikePage.gotoBikesPage();

    await expect(bikePage.bikeTag).toHaveText('Not ready');

    await bikePage.gotoJobsPage();

    await bikePage.pageJobs.getByTestId('btn-job-approve').click();
    await bikePage.pageJobs.getByTestId('btn-job-start').click();
    await bikePage.pageJobs.getByTestId('btn-job-complete').click();

    await bikePage.gotoBikesPage();

    await expect(bikePage.bikeTag).toHaveText('Ready');
  });

  test('Bike shows "Ready" when open job is cancelled', async () => {
    const bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await expect(bikePage.bikeTag).toHaveText('Ready');

    await bikePage.gotoJobsPage();

    await jobsPage.addJob('Oil Change', bike.make, bike.model, '20000');

    await bikePage.gotoBikesPage();

    await expect(bikePage.bikeTag).toHaveText('Not ready');

    await bikePage.gotoJobsPage();

    await bikePage.pageJobs.getByTestId('btn-job-cancel').click();

    await bikePage.gotoBikesPage();

    await expect(bikePage.bikeTag).toHaveText('Ready');
  });
});
