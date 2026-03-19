import { test, expect } from '@playwright/test';
import { uniqueEmail } from '../utils/test-data';
import { API_URL } from '../utils/constants';
import {
  registerUser,
  loginUser,
  addBike,
  addJob,
  listJobs,
  updateJob,
} from '../utils/api-helpers';
import { JobResponse } from '../types/job';

test.describe('Jobs API test suite', () => {
  let email: string;
  let user_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-garage');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
  });

  test.describe('Create/list bike jobs test suite', () => {
    test('Create job with valid data succeeds', async ({ request }) => {
      const bike_id = await addBike(request, user_id);

      await addJob(request, bike_id, user_id);

      const jobs = await listJobs(request, user_id);

      expect(jobs).toHaveLength(1);
      expect(jobs.every((job) => job.user_id === user_id)).toBeTruthy();
      expect(jobs.every((job) => job.bike_id === bike_id)).toBeTruthy();
      expect(jobs.every((job) => job.status === 'requested')).toBeTruthy();
    });

    test('Create job with missing bike_id is rejected', async ({ request }) => {
      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            service_type: 'Oil change',
            odometer: 24500,
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('bike_id is required');
    });

    test('Create job with missing service_type is rejected', async ({
      request,
    }) => {
      const bike_id = await addBike(request, user_id);

      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            bike_id,
            odometer: 24500,
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('service_type is required');
    });

    test('Create job with missing odometer is rejected', async ({
      request,
    }) => {
      const bike_id = await addBike(request, user_id);

      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            bike_id,
            service_type: 'Oil change',
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('odometer is required');
    });

    test('Create job with invalid negative odometer is rejected', async ({
      request,
    }) => {
      const bike_id = await addBike(request, user_id);

      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            bike_id,
            service_type: 'Oil change',
            odometer: -1000,
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('odometer cannot be a negative integer');
    });

    test('Create job with invalid string odometer is rejected', async ({
      request,
    }) => {
      const bike_id = await addBike(request, user_id);

      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            bike_id,
            service_type: 'Oil change',
            odometer: '1000',
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('odometer must be a number');
    });

    test('Jobs list returns only current user jobs', async ({ request }) => {
      const bike_id_1 = await addBike(request, user_id);
      await addJob(request, bike_id_1, user_id);

      const email = uniqueEmail('api-garage');
      await registerUser(request, email);
      const body = await loginUser(request, email);
      const user_id_2 = body.user.id;
      const bike_id_2 = await addBike(request, user_id_2);
      await addJob(request, bike_id_2, user_id_2);
      await addJob(request, bike_id_2, user_id_2, {
        service_type: 'Oil change',
        odometer: 50000,
      });

      const jobs_user_1 = await listJobs(request, user_id);
      const jobs_user_2 = await listJobs(request, user_id_2);

      expect(jobs_user_1).toHaveLength(1);
      expect(jobs_user_1.every((job) => job.user_id === user_id)).toBeTruthy();
      expect(
        jobs_user_1.every((job) => job.bike_id === bike_id_1),
      ).toBeTruthy();

      expect(jobs_user_2).toHaveLength(2);
      expect(
        jobs_user_2.every((job) => job.user_id === user_id_2),
      ).toBeTruthy();
      expect(
        jobs_user_2.every((job) => job.bike_id === bike_id_2),
      ).toBeTruthy();
      expect(
        jobs_user_2.every((job) => job.status === 'requested'),
      ).toBeTruthy();
    });

    test('Update non-existing job is rejected', async ({ request }) => {
      const response = await request.patch(
        `${API_URL}/jobs/testid/status?user_id=${user_id}`,
        {
          data: {
            status: 'approved',
          },
        },
      );

      expect(response.status()).toBe(404);

      const body = await response.json();

      expect(body.error).toBe('Job not found');
    });

    test('Update other user job is rejected', async ({ request }) => {
      const email = uniqueEmail('api-garage');
      await registerUser(request, email);
      const body = await loginUser(request, email);
      const user_id_2 = body.user.id;
      const bike_id_2 = await addBike(request, user_id_2);
      const job_2 = await addJob(request, bike_id_2, user_id_2);

      const job_id_2 = job_2.id;

      const response = await request.patch(
        `${API_URL}/jobs/${job_id_2}/status?user_id=${user_id}`,
        {
          data: {
            status: 'approved',
          },
        },
      );

      expect(response.status()).toBe(403);

      const resBody = await response.json();

      expect(resBody.error).toBe('Forbidden');
    });
  });

  test.describe('Valid job status transitions test suite', () => {
    let bike_id: string;
    let job: JobResponse;
    let id: string;

    test.beforeEach(async ({ request }) => {
      bike_id = await addBike(request, user_id);
      job = await addJob(request, bike_id, user_id);
      id = job.id;
    });

    test('Requested > Approved job transition is accepted', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'approved');
      const jobs = await listJobs(request, user_id);

      expect(jobs.every((job) => job.status === 'approved')).toBeTruthy();
    });

    test('Approved > In progress job transition is accepted', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'approved');
      await updateJob(request, id, user_id, 'in_progress');

      const jobs = await listJobs(request, user_id);

      expect(jobs.every((job) => job.status === 'in_progress')).toBeTruthy();
      expect(jobs.every((job) => job.status === 'approved')).toBeFalsy();
    });

    test('In progress > Done job transition is accepted', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'approved');
      await updateJob(request, id, user_id, 'in_progress');
      await updateJob(request, id, user_id, 'done');

      const jobs = await listJobs(request, user_id);

      expect(jobs.every((job) => job.status === 'done')).toBeTruthy();
      expect(jobs.every((job) => job.status === 'in_progress')).toBeFalsy();
    });

    test('Requested > Cancelled job transition is accepted', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'cancelled');

      const jobs = await listJobs(request, user_id);

      expect(jobs.every((job) => job.status === 'cancelled')).toBeTruthy();
    });

    test('Approved > Cancelled job transition is accepted', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'approved');
      await updateJob(request, id, user_id, 'cancelled');

      const jobs = await listJobs(request, user_id);

      expect(jobs.every((job) => job.status === 'cancelled')).toBeTruthy();
      expect(jobs.every((job) => job.status === 'approved')).toBeFalsy();
    });
  });

  test.describe('Invalid job status transitions test suite', () => {
    let bike_id: string;
    let job: JobResponse;
    let id: string;

    test.beforeEach(async ({ request }) => {
      bike_id = await addBike(request, user_id);
      job = await addJob(request, bike_id, user_id);
      id = job.id;
    });

    test('Requested > Done job transition is rejected', async ({ request }) => {
      const response = await request.patch(
        `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
        {
          data: {
            status: 'done',
          },
        },
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from requested to done',
      );
    });

    test('Requested > In progress job transition is rejected', async ({
      request,
    }) => {
      const response = await request.patch(
        `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
        {
          data: {
            status: 'in_progress',
          },
        },
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from requested to in_progress',
      );
    });

    test('Approved > Done job transition is rejected', async ({ request }) => {
      await updateJob(request, id, user_id, 'approved');

      const response = await request.patch(
        `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
        {
          data: {
            status: 'done',
          },
        },
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from approved to done',
      );
    });

    test('Done > Approved job transition is rejected', async ({ request }) => {
      await updateJob(request, id, user_id, 'approved');
      await updateJob(request, id, user_id, 'in_progress');
      await updateJob(request, id, user_id, 'done');

      const response = await request.patch(
        `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
        {
          data: {
            status: 'approved',
          },
        },
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from done to approved',
      );
    });

    test('Cancelled > Approved job transition is rejected', async ({
      request,
    }) => {
      await updateJob(request, id, user_id, 'cancelled');

      const response = await request.patch(
        `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
        {
          data: {
            status: 'approved',
          },
        },
      );

      expect(response.status()).toBe(400);

      const resBody = await response.json();

      expect(resBody.error).toBe(
        'Invalid status transition from cancelled to approved',
      );
    });
  });
});
