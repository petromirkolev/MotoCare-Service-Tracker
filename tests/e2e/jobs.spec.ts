import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RegisterPage } from '../pages/register-page';
import { validInput, uniqueEmail } from '../utils/test-data';
import { BikesPage } from '../pages/bikes-page';
import { JobsPage } from '../pages/jobs-page';

function uniqueBike() {
  const suffix = Date.now().toString();
  return {
    make: `Yamaha-${suffix}`,
    model: `Tracer-9GT-${suffix}`,
    year: '2021',
  };
}

const job = {
  oilService: 'Oil Change',
  chainService: 'Chain Service',
  odo: '1000',
};

test.describe('Jobs test suite', () => {
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

    bike = uniqueBike();

    await bikePage.addBike(bike);
    await bikePage.expectBikeVisible(bike.make);

    await jobsPage.gotoJobsPage();
  });

  test.describe('Jobs create and validation test suite', () => {
    test('User can successfully create a job with valid data', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );
      await jobsPage.expectJobVisible(job.oilService);
    });

    test('Created job persists after page reload', async ({ page }) => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );
      await jobsPage.expectJobVisible(job.oilService);

      await page.reload();

      await jobsPage.gotoJobsPage();
      await jobsPage.expectJobVisible(job.oilService);
    });

    test('Create job with missing bike is rejected', async () => {
      await jobsPage.addJob(job.oilService, 'Select bike', job.odo);

      await jobsPage.expectError('Bike is required');
    });

    test('Create job with missing service type is rejected', async () => {
      await jobsPage.addJob(
        'Select service type',
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectError('Service type is required');
    });

    test('Create job with missing odometer is rejected', async () => {
      await jobsPage.addJob(job.oilService, `${bike.make} ${bike.model}`, '');

      await jobsPage.expectError('Odometer is required');
    });

    test('Create job with negative odometer is rejected', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        '-1000',
      );

      await jobsPage.expectError('Odometer must be a valid number');
    });
  });

  test.describe('Jobs status flow test suite', () => {
    test('Job status is successfully changed from "Requested" to "Approved"', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectJobVisible(job.oilService);
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(job.oilService, 'approved');

      await expect(jobsPage.jobStatus).toHaveText('Approved');
    });

    test('Job status is successfully changed from "Approved" to "In progress"', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectJobVisible(job.oilService);
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(job.oilService, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(job.oilService, 'started');
      await expect(jobsPage.jobStatus).toHaveText('In Progress');
    });

    test('Job status is successfully changed from "In progress" to "Done"', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectJobVisible(job.oilService);
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(job.oilService, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(job.oilService, 'started');
      await expect(jobsPage.jobStatus).toHaveText('In Progress');

      await jobsPage.markJobAs(job.oilService, 'done');
      await expect(jobsPage.jobStatus).toHaveText('Done');
    });

    test('Job status is successfully changed from "Requested" to "Cancelled"', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectJobVisible(job.oilService);
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(job.oilService, 'cancelled');
      await expect(jobsPage.jobStatus).toHaveText('Cancelled');
    });

    test('Job status is successfully changed from "Approved" to "Cancelled"', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );

      await jobsPage.expectJobVisible(job.oilService);
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(job.oilService, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(job.oilService, 'cancelled');
      await expect(jobsPage.jobStatus).toHaveText('Cancelled');
    });
  });

  test.describe('Jobs filtering test suite', () => {
    test.beforeEach(async ({ page }) => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );
      await jobsPage.expectJobVisible(job.oilService);

      await jobsPage.addJob(
        job.chainService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );
      await jobsPage.expectJobVisible(job.chainService);

      await page.evaluate(() => window.scrollTo(0, 0));

      await expect
        .poll(async () => {
          return await page.evaluate(() => window.scrollY);
        })
        .toBe(0);
    });

    test('"All" filter shows all jobs', async ({ page }) => {
      await jobsPage.filterJobs('all');

      await jobsPage.expectJobVisible(job.oilService);
      await jobsPage.expectJobVisible(job.chainService);
    });

    test('"Requested" filter shows only requested jobs', async () => {
      await jobsPage.markJobAs(job.oilService, 'approved');

      await jobsPage.filterJobs('requested');

      await jobsPage.expectJobVisible(job.chainService);
      await jobsPage.expectJobNotVisible(job.oilService);
    });

    test('"Approved" filter shows only approved jobs', async () => {
      await jobsPage.markJobAs(job.oilService, 'approved');

      await jobsPage.filterJobs('approved');

      await jobsPage.expectJobVisible(job.oilService);
      await jobsPage.expectJobNotVisible(job.chainService);
    });

    test('"In progress" filter shows only in progress jobs', async () => {
      await jobsPage.markJobAs(job.oilService, 'approved');
      await jobsPage.markJobAs(job.oilService, 'started');

      await jobsPage.filterJobs('inprogress');

      await jobsPage.expectJobVisible(job.oilService);
      await jobsPage.expectJobNotVisible(job.chainService);
    });

    test('"Done" filter shows only done jobs', async () => {
      await jobsPage.markJobAs(job.oilService, 'approved');
      await jobsPage.markJobAs(job.oilService, 'started');
      await jobsPage.markJobAs(job.oilService, 'done');

      await jobsPage.filterJobs('done');

      await jobsPage.expectJobVisible(job.oilService);
      await jobsPage.expectJobNotVisible(job.chainService);
    });

    test('"Cancelled" filter shows only cancelled jobs', async () => {
      await jobsPage.markJobAs(job.oilService, 'cancelled');

      await jobsPage.filterJobs('cancelled');

      await jobsPage.expectJobVisible(job.oilService);
      await jobsPage.expectJobNotVisible(job.chainService);
    });
  });

  test.describe('Jobs integrity test suite', () => {
    test('Deleting a bike removes related jobs from UI', async () => {
      await jobsPage.addJob(
        job.oilService,
        `${bike.make} ${bike.model}`,
        job.odo,
      );
      await jobsPage.expectJobVisible(job.oilService);

      await bikePage.gotoBikesPage();

      await bikePage.deleteBikeByName(bike.make);

      await jobsPage.gotoJobsPage();

      await jobsPage.expectJobNotVisible(job.oilService);
    });
  });
});
