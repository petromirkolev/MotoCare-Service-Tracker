import { test, expect } from '@playwright/test';
import { uniqueEmail } from '../utils/test-data';
import { API_URL } from '../utils/constants';
import {
  registerUser,
  loginUser,
  addBike,
  listBikes,
  addJob,
} from '../utils/api-helpers';

test.describe('Garage API test suite', () => {
  let email: string;
  let user_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-garage');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
  });

  test('Create bike with valid data succeeds', async ({ request }) => {
    await addBike(request, user_id);
  });

  test('Create bike with missing make is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: '',
        model: 'Tracer 9GT',
        year: 2020,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Make is required');
  });

  test('Create bike with missing model is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: '',
        year: 2020,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Model is required');
  });

  test('Create bike with missing year is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: '',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Year is required');
  });

  test('Create bike with invalid year < 1900 is rejected', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: '1899',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Create bike with invalid year > 2100 is rejected', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: '2101',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Bikes list returns only current user bikes', async ({ request }) => {
    const email = uniqueEmail('test-api-garage');
    await addBike(request, user_id);
    await registerUser(request, email);

    const body = await loginUser(request, email);
    const user_id_2 = body.user.id;

    await addBike(request, user_id_2, {
      make: 'Honda',
      model: 'Rebel',
      year: 2020,
    });

    const bikes = await listBikes(request, user_id);

    expect(bikes.length).toBe(1);
    expect(bikes.every((bike) => bike.user_id === user_id)).toBe(true);
    expect(bikes.some((bike) => bike.make === 'Honda')).toBe(false);
  });

  test('Deleting a bike successfully removes it from the database', async ({
    request,
  }) => {
    const bike_id = await addBike(request, user_id);

    const deleteResponse = await request.delete(
      `${API_URL}/bikes/${bike_id}?user_id=${user_id}`,
    );

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe('Bike deleted successfully');

    const bikes = await listBikes(request, user_id);
    expect(bikes).toHaveLength(0);
  });

  test('Deleting bike removes related jobs', async ({ request }) => {
    const bike_id = await addBike(request, user_id);

    await addJob(request, bike_id, user_id);

    const deleteResponse = await request.delete(
      `${API_URL}/bikes/${bike_id}?user_id=${user_id}`,
    );

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe('Bike deleted successfully');

    const jobsResponse = await request.get(
      `${API_URL}/jobs?user_id=${user_id}`,
    );
    expect(jobsResponse.status()).toBe(200);

    const jobsBody = await jobsResponse.json();
    expect(jobsBody.jobs).toHaveLength(0);
  });
});
