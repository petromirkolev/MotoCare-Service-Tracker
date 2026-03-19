import { test, expect } from '@playwright/test';
import { uniqueEmail } from '../utils/test-data';
import { API_URL, PASSWORD } from '../utils/constants';
import { registerUser } from '../utils/api-helpers';

test.describe('Auth API test suite', () => {
  let email: string;

  test.beforeEach(async () => {
    email = uniqueEmail('api-auth');
  });

  test('Register with valid credentials succeeds', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: PASSWORD,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.message).toBe('User registered successfully');
  });

  test('Register with duplicate email is rejected', async ({ request }) => {
    await registerUser(request, email);

    const duplicateResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: PASSWORD,
      },
    });

    expect(duplicateResponse.status()).toBe(409);

    const duplicateBody = await duplicateResponse.json();
    expect(duplicateBody.error).toBe('User already exists');
  });

  test('Register with invalid email is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: '##@abv.bg',
        password: PASSWORD,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
  });

  test('Register with missing email is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: '',
        password: PASSWORD,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Email and password are required');
  });

  test('Register with missing password is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: '',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Email and password are required');
  });

  test('Register with short password is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: 'test',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Password must be at least 8 characters');
  });

  test('Register with long password is rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password:
          'testingthesuperlongpasswordtwotimestestingthesuperlongpasswordtwotimes',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Password must be 32 characters at most');
  });

  test('Login with valid credentials succeeds', async ({ request }) => {
    await registerUser(request, email);

    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email,
        password: PASSWORD,
      },
    });

    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    expect(loginBody.message).toBe('Login successful');
  });

  test('Login with wrong password is rejected', async ({ request }) => {
    await registerUser(request, email);

    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email,
        password: 'testingpass1',
      },
    });

    expect(loginResponse.status()).toBe(401);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe('Invalid credentials');
  });

  test('Login with non existing email is rejected', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email,
        password: PASSWORD,
      },
    });

    expect(loginResponse.status()).toBe(401);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe('Invalid credentials');
  });

  test('Login with missing email is rejected', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: '',
        password: PASSWORD,
      },
    });

    expect(loginResponse.status()).toBe(400);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe('Email and password are required');
  });

  test('Login with missing password is rejected', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email,
        password: '',
      },
    });

    expect(loginResponse.status()).toBe(400);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe('Email and password are required');
  });
});
