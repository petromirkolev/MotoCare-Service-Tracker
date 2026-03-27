import { test, expect } from '../fixtures/api';
import { uniqueEmail } from '../utils/test-data';
import {
  registerUser,
  loginUser,
  addBike,
  addJobApi,
  listJobsApi,
  updateJobApi,
} from '../utils/api-helpers';

test.describe('Jobs API', () => {
  test.describe('Create/list bike jobs', () => {
    test('Create job with valid data succeeds', async ({
      request,
      loginResult,
      garageWithBike,
      validJobData,
    }) => {
      await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        { ...validJobData },
      );

      const response = await listJobsApi(request, loginResult.body.user.id);

      const body = await response.json();

      expect(body.jobs).toHaveLength(1);
      expect(
        body.jobs.every((job) => job.user_id === loginResult.body.user.id),
      ).toBeTruthy();
      expect(
        body.jobs.every((job) => job.bike_id === garageWithBike.body.bike.id),
      ).toBeTruthy();
      expect(body.jobs.every((job) => job.status === 'requested')).toBeTruthy();
    });

    test('Create job with missing bike_id is rejected', async ({
      request,
      loginResult,
    }) => {
      const response = await addJobApi(
        request,
        undefined,
        loginResult.body.user.id,
        {
          service_type: 'Oil change',
          odometer: 24500,
          note: 'Change the oil',
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe('bike_id is required');
    });

    test('Create job with missing service_type is rejected', async ({
      request,
      loginResult,
      garageWithBike,
    }) => {
      const response = await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        { odometer: 24500, note: 'Change the oil' },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe('service_type is required');
    });

    test('Create job with missing odometer is rejected', async ({
      request,
      loginResult,
      garageWithBike,
    }) => {
      const response = await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        { service_type: 'Oil change', note: 'Change the oil' },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe('odometer is required');
    });

    test('Create job with invalid negative odometer is rejected', async ({
      request,
      loginResult,
      garageWithBike,
    }) => {
      const response = await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        {
          service_type: 'Oil change',
          odometer: -1000,
          note: 'Change the oil',
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe('odometer cannot be a negative integer');
    });

    test('Create job with invalid string odometer is rejected', async ({
      request,
      loginResult,
      garageWithBike,
    }) => {
      const response = await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        {
          service_type: 'Oil change',
          odometer: '1000',
          note: 'Change the oil',
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe('odometer must be a number');
    });

    test('Jobs list returns only current user jobs', async ({
      request,
      loginResult,
      garageWithBike,
      validJobData,
    }) => {
      await addJobApi(
        request,
        garageWithBike.body.bike.id,
        loginResult.body.user.id,
        { ...validJobData },
      );

      const email = uniqueEmail();

      await registerUser(request, email);

      const body = await loginUser(request, email);

      const user_2_id = body.user.id;

      const bike_2 = await addBike(request, user_2_id);

      await addJobApi(request, bike_2, user_2_id, { ...validJobData });
      await addJobApi(request, bike_2, user_2_id, {
        service_type: 'Oil change',
        odometer: 1000,
      });

      const user_1_response = await listJobsApi(
        request,
        loginResult.body.user.id,
      );
      const user_1_body = await user_1_response.json();

      const user_2_response = await listJobsApi(request, user_2_id);

      const user_2_body = await user_2_response.json();

      expect(user_1_body.jobs).toHaveLength(1);
      expect(
        user_1_body.jobs.every(
          (job) => job.user_id === loginResult.body.user.id,
        ),
      ).toBeTruthy();
      expect(
        user_1_body.jobs.every(
          (job) => job.bike_id === garageWithBike.body.bike.id,
        ),
      ).toBeTruthy();

      expect(user_2_body.jobs).toHaveLength(2);
      expect(
        user_2_body.jobs.every((job) => job.user_id === user_2_id),
      ).toBeTruthy();
      expect(
        user_2_body.jobs.every((job) => job.bike_id === bike_2),
      ).toBeTruthy();
      expect(
        user_2_body.jobs.every((job) => job.status === 'requested'),
      ).toBeTruthy();
    });

    test('Update non-existing job is rejected', async ({
      request,
      loginResult,
      garageWithBike,
    }) => {
      const response = await updateJobApi(
        request,
        undefined,
        loginResult.body.user.id,
        'approved',
      );

      expect(response.status()).toBe(404);
    });

    test('Update other user job is rejected', async ({
      request,
      loginResult,
      garageWithBike,
      validJobData,
    }) => {
      const email = uniqueEmail();
      await registerUser(request, email);
      const body = await loginUser(request, email);
      const user_2_id = body.user.id;

      const bike_2 = await addBike(request, user_2_id);
      const add_job_response = await addJobApi(request, bike_2, user_2_id, {
        ...validJobData,
      });

      const job_body = await add_job_response.json();

      const response = await updateJobApi(
        request,
        job_body.id,
        loginResult.body.user.id,
        'approved',
      );

      expect(response.status()).toBe(403);

      const resBody = await response.json();

      expect(resBody.error).toBe('Forbidden');
    });
  });

  test.describe('Valid job status transitions', () => {
    test('Requested > Approved job transition is accepted', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      const jobs = await listJobsApi(request, bikeWithOneJob.user_id);

      const response = await jobs.json();

      expect(
        response.jobs.every((job) => job.status === 'approved'),
      ).toBeTruthy();
    });

    test('Approved > In progress job transition is accepted', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'in_progress',
      );

      const jobs = await listJobsApi(request, bikeWithOneJob.user_id);

      const response = await jobs.json();

      expect(
        response.jobs.every((job) => job.status === 'in_progress'),
      ).toBeTruthy();
    });

    test('In progress > Done job transition is accepted', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'in_progress',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'done',
      );

      const jobs = await listJobsApi(request, bikeWithOneJob.user_id);

      const response = await jobs.json();

      expect(response.jobs.every((job) => job.status === 'done')).toBeTruthy();
    });

    test('Requested > Cancelled job transition is accepted', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'cancelled',
      );

      const jobs = await listJobsApi(request, bikeWithOneJob.user_id);

      const response = await jobs.json();

      expect(
        response.jobs.every((job) => job.status === 'cancelled'),
      ).toBeTruthy();
    });

    test('Approved > Cancelled job transition is accepted', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'cancelled',
      );

      const jobs = await listJobsApi(request, bikeWithOneJob.user_id);

      const response = await jobs.json();

      expect(
        response.jobs.every((job) => job.status === 'cancelled'),
      ).toBeTruthy();
    });
  });

  test.describe('Invalid job status transitions', () => {
    test('Requested > Done job transition is rejected', async ({
      request,
      bikeWithOneJob,
    }) => {
      const response = await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'done',
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe(
        'Invalid status transition from requested to done',
      );
    });

    test('Requested > In progress job transition is rejected', async ({
      request,
      bikeWithOneJob,
    }) => {
      const response = await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'in_progress',
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from requested to in_progress',
      );
    });

    test('Approved > Done job transition is rejected', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );
      const response = await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'done',
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from approved to done',
      );
    });

    test('Done > Approved job transition is rejected', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'in_progress',
      );

      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'done',
      );

      const response = await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from done to approved',
      );
    });

    test('Cancelled > Approved job transition is rejected', async ({
      request,
      bikeWithOneJob,
    }) => {
      await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'cancelled',
      );

      const response = await updateJobApi(
        request,
        bikeWithOneJob.job.id,
        bikeWithOneJob.user_id,
        'approved',
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from cancelled to approved',
      );
    });
  });
});
