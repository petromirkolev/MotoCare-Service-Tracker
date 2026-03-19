import { test, expect } from '@playwright/test';
import { uniqueEmail } from '../utils/test-data';
import { API_URL } from '../utils/constants';
import {
  registerUser,
  loginUser,
  addBike,
  addJob,
  listJobs,
  deleteBike,
} from '../utils/api-helpers';

test.describe('Jobs API test suite', () => {
  let email: string;
  let user_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-garage');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
  });

  test.describe('Create / List bike jobs', () => {
    test('Create job with valid data succeeds', async ({ request }) => {
      const bike_id = await addBike(request, user_id);

      await addJob(request, bike_id, user_id);

      const jobs = await listJobs(request, user_id);

      expect(jobs.length).toBe(1);
      expect(jobs.every((job) => job.user_id === user_id)).toBe(true);
      expect(jobs.every((job) => job.bike_id === bike_id)).toBe(true);
      expect(jobs.every((job) => job.status === 'requested')).toBe(true);
    });

    test('Create job with missing bike_id is rejected', async ({ request }) => {
      const response = await request.post(
        `${API_URL}/jobs?user_id=${user_id}`,
        {
          data: {
            service_type: 'Oil Change',
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
            service_type: 'Oil Change',
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
            service_type: 'Oil Change',
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
            service_type: 'Oil Change',
            odometer: '1000',
            note: 'Change the oil',
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('odometer must be a number');
    });
  });
});

// jobs list returns only current user jobs
// update non-existent job returns 404
// update other user’s job returns 403

//// valid transitions
// requested -> approved succeeds
// approved -> in_progress succeeds
// in_progress -> done succeeds
// requested -> cancelled succeeds
// approved -> cancelled succeeds

//// invalid transitions
// requested -> done rejected
// requested -> in_progress rejected
// approved -> done rejected
// done -> approved rejected
// cancelled -> approved rejected
