import { API_URL, PASSWORD } from './constants';
import { expect, APIRequestContext } from '@playwright/test';
import type { LoginResponse } from '../types/login';
import { JobResponse } from '../types/job';

export async function registerUser(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
): Promise<void> {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.message).toBe('User registered successfully');
}

export async function loginUser(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
): Promise<LoginResponse> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.message).toBe('Login successful');

  return body as LoginResponse;
}

export async function addBike(
  request: APIRequestContext,
  user_id: string,
  overrides: Partial<{
    make: string;
    model: string;
    year: number;
  }> = {},
): Promise<string> {
  const response = await request.post(`${API_URL}/bikes`, {
    data: {
      user_id,
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: 2021,
      ...overrides,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();

  expect(body.message).toBe('Bike created successfully');

  return body.bike.id;
}

export async function listBikes(
  request: APIRequestContext,
  user_id: string,
): Promise<any[]> {
  const response = await request.get(`${API_URL}/bikes?user_id=${user_id}`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  return body.bikes;
}

export async function deleteBike(
  request: APIRequestContext,
  bike_id: string,
  user_id: string,
): Promise<void> {
  const response = await request.delete(
    `${API_URL}/bikes/${bike_id}?user_id=${user_id}`,
  );

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.message).toBe('Bike deleted successfully');
}

export async function addJob(
  request: APIRequestContext,
  bike_id: string,
  user_id: string,
  overrides: Partial<{
    service_type: string;
    odometer: number;
    note: string;
  }> = {},
): Promise<JobResponse> {
  const response = await request.post(`${API_URL}/jobs?user_id=${user_id}`, {
    data: {
      bike_id,
      service_type: 'Oil Change',
      odometer: 24500,
      note: 'Change the oil',
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.message).toBe('Job created successfully');

  return body;
}

export async function listJobs(
  request: APIRequestContext,
  user_id: string,
): Promise<any[]> {
  const response = await request.get(`${API_URL}/jobs?user_id=${user_id}`);

  expect(response.status()).toBe(200);

  const body = await response.json();

  return body.jobs;
}

export async function updateJob(
  request: APIRequestContext,
  id: string,
  user_id: string,
  status: string,
): Promise<void> {
  const response = await request.patch(
    `${API_URL}/jobs/${id}/status?user_id=${user_id}`,
    {
      data: {
        status,
      },
    },
  );

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.message).toBe('Job status updated successfully');
}
