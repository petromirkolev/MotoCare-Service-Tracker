import { test, expect } from '../fixtures/jobs';

test.describe('Jobs', () => {
  test.describe('Job creation and validation', () => {
    test.beforeEach(async ({ garageWithOneBike, jobsPage }) => {
      await jobsPage.gotoJobsPage();
    });

    test('User can successfully create a job with valid data', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(seededJob.service, seededJob.bike, seededJob.odo);

      await jobsPage.expectJobVisible(seededJob.service);
    });

    test.only('Created job persists after page reload', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(seededJob.service, seededJob.bike, seededJob.odo);
      await jobsPage.expectJobVisible(seededJob.service);

      await jobsPage.page.reload();

      await expect(jobsPage.jobsNav).toBeVisible();
      await expect(jobsPage.jobsNav).toBeEnabled();

      await jobsPage.gotoJobsPage();
      await jobsPage.expectJobVisible(seededJob.service);
    });

    test('Create job with missing bike is rejected', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(seededJob.service, 'Select bike', seededJob.odo);

      await jobsPage.expectError('Bike is required');
    });

    test('Create job with missing service type is rejected', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(
        'Select service type',
        seededJob.bike,
        seededJob.odo,
      );

      await jobsPage.expectError('Service type is required');
    });

    test('Create job with missing odometer is rejected', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(seededJob.service, seededJob.bike, '');

      await jobsPage.expectError('Odometer is required');
    });

    test('Create job with negative odometer is rejected', async ({
      seededJob,
      jobsPage,
    }) => {
      await jobsPage.addJob(seededJob.service, seededJob.bike, '-1000');

      await jobsPage.expectError('Odometer must be a valid number');
    });
  });

  test.describe('Job status flow', () => {
    test('Job status is successfully changed from "Requested" to "Approved"', async ({
      bikeWithOneJob,
      jobsPage,
    }) => {
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'approved');

      await expect(jobsPage.jobStatus).toHaveText('Approved');
    });

    test('Job status is successfully changed from "Approved" to "In progress"', async ({
      bikeWithOneJob,
      jobsPage,
    }) => {
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'started');
      await expect(jobsPage.jobStatus).toHaveText('In Progress');
    });

    test('Job status is successfully changed from "In progress" to "Done"', async ({
      bikeWithOneJob,

      jobsPage,
    }) => {
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'started');
      await expect(jobsPage.jobStatus).toHaveText('In Progress');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'done');
      await expect(jobsPage.jobStatus).toHaveText('Done');
    });

    test('Job status is successfully changed from "Requested" to "Cancelled"', async ({
      bikeWithOneJob,
      jobsPage,
    }) => {
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'cancelled');
      await expect(jobsPage.jobStatus).toHaveText('Cancelled');
    });

    test('Job status is successfully changed from "Approved" to "Cancelled"', async ({
      bikeWithOneJob,
      jobsPage,
    }) => {
      await expect(jobsPage.jobStatus).toHaveText('Requested');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'approved');
      await expect(jobsPage.jobStatus).toHaveText('Approved');

      await jobsPage.markJobAs(bikeWithOneJob.job.service, 'cancelled');
      await expect(jobsPage.jobStatus).toHaveText('Cancelled');
    });
  });

  test.describe('Job filtering', () => {
    test('"All" filter shows all jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.filterJobs('all');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.secondJob.service);
      await jobsPage.expectJobVisible(bikeWithTwoJobs.firstJob.service);
    });

    test('"Requested" filter shows only requested jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'approved');

      await jobsPage.filterJobs('requested');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.secondJob.service);
      await jobsPage.expectJobNotVisible(bikeWithTwoJobs.firstJob.service);
    });

    test('"Approved" filter shows only approved jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'approved');

      await jobsPage.filterJobs('approved');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.firstJob.service);
      await jobsPage.expectJobNotVisible(bikeWithTwoJobs.secondJob.service);
    });

    test('"In progress" filter shows only in progress jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'approved');
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'started');

      await jobsPage.filterJobs('in-progress');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.firstJob.service);
      await jobsPage.expectJobNotVisible(bikeWithTwoJobs.secondJob.service);
    });

    test('"Done" filter shows only done jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'approved');
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'started');
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'done');

      await jobsPage.filterJobs('done');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.firstJob.service);
      await jobsPage.expectJobNotVisible(bikeWithTwoJobs.secondJob.service);
    });

    test('"Cancelled" filter shows only cancelled jobs', async ({
      bikeWithTwoJobs,
      jobsPage,
    }) => {
      await jobsPage.markJobAs(bikeWithTwoJobs.firstJob.service, 'cancelled');

      await jobsPage.filterJobs('cancelled');

      await jobsPage.expectJobVisible(bikeWithTwoJobs.firstJob.service);
      await jobsPage.expectJobNotVisible(bikeWithTwoJobs.secondJob.service);
    });
  });

  test.describe('Job integrity', () => {
    test('Deleting a bike removes related jobs from UI', async ({
      bikeWithOneJob,
      bikesPage,
      jobsPage,
    }) => {
      await bikesPage.gotoBikesPage();

      await bikesPage.deleteBikeByName(bikeWithOneJob.bike.make);

      await jobsPage.gotoJobsPage();

      await jobsPage.expectJobNotVisible(bikeWithOneJob.job.service);
    });
  });
});
