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

const job = {
  service: 'Oil Change',
  odo: '1000',
};

test.describe('Bikes test suite', () => {
  let loginPage: LoginPage;
  let bikePage: BikesPage;
  let registerPage: RegisterPage;
  let jobsPage: JobsPage;
  let email: string;
  let password: string;
  let bike: { make: string; model: string; year: string };

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
    await expect(loginPage.loginMessage).toContainText(
      'Login success, opening garage...',
    );

    bike = seededBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await jobsPage.gotoJobsPage();
  });

  test('User can successfully create a job with valid data', async () => {
    await jobsPage.addJob(job.service, `${bike.make} ${bike.model}`, job.odo);
    await jobsPage.expectJobVisible(job.service);
  });

  test('Created job persists after page reload', async ({ page }) => {
    await jobsPage.addJob(job.service, `${bike.make} ${bike.model}`, job.odo);
    await jobsPage.expectJobVisible(job.service);

    await page.reload();

    await jobsPage.gotoJobsPage();
    await jobsPage.expectJobVisible(job.service);
  });

  test('Create job with missing bike is rejected', async ({ page }) => {
    await jobsPage.addJob(job.service, 'Select bike', job.odo);

    await jobsPage.expectError('Bike is required');
  });

  test('Create job with missing service type is rejected', async ({ page }) => {
    await jobsPage.addJob(
      'Select service type',
      `${bike.make} ${bike.model}`,
      job.odo,
    );

    await jobsPage.expectError('Service type is required');
  });

  test('Create job with missing odometer is rejected', async ({ page }) => {
    await jobsPage.addJob(job.service, `${bike.make} ${bike.model}`, '');

    await jobsPage.expectError('Odometer is required');
  });

  test('Create job with negative odometer is rejected', async ({ page }) => {
    await jobsPage.addJob(job.service, `${bike.make} ${bike.model}`, '-1000');

    await jobsPage.expectError('Odometer must be a valid number');
  });
});

// Status flow
// requested → approved
// approved → in progress
// in progress → done
// requested → cancelled
// approved → cancelled

// Filtering
// all filter shows all jobs
// requested filter shows only requested jobs
// approved filter shows only approved jobs
// in progress filter shows only in progress jobs
// done filter shows only done jobs
// cancelled filter shows only cancelled jobs
// active filter button changes correctly

// Integrity
// deleting a bike removes related jobs from UI
