import {
  test,
  expect,
  uniqueEmail,
  addBikeApi,
  addJobApi,
} from '../fixtures/api';
import {
  registerUser,
  loginUser,
  addBike,
  listBikesApi,
  deleteBikeApi,
  listJobsApi,
} from '../utils/api-helpers';

test.describe('Garage API', () => {
  test('Create bike with valid data succeeds', async ({
    request,
    loginResult,
    validBikeData,
  }) => {
    const response = await addBikeApi(
      request,
      loginResult.body.user.id,
      validBikeData,
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.message).toBe('Bike created successfully');
  });

  test('Create bike with missing make is rejected', async ({
    loginResult,
    request,
  }) => {
    const response = await addBikeApi(request, loginResult.body.user.id, {
      model: 'Tracer 9GT',
      year: 2020,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Make is required');
  });

  test('Create bike with missing model is rejected', async ({
    request,
    loginResult,
  }) => {
    const response = await addBikeApi(request, loginResult.body.user.id, {
      make: 'Yamaha',
      year: 2020,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Model is required');
  });

  test('Create bike with missing year is rejected', async ({
    request,
    loginResult,
  }) => {
    const response = await addBikeApi(request, loginResult.body.user.id, {
      make: 'Yamaha',
      model: 'Tracer 9GT',
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Year is required');
  });

  test('Create bike with invalid year < 1900 is rejected', async ({
    request,
    loginResult,
  }) => {
    const response = await addBikeApi(request, loginResult.body.user.id, {
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: 1899,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Create bike with invalid year > 2100 is rejected', async ({
    request,
    loginResult,
  }) => {
    const response = await addBikeApi(request, loginResult.body.user.id, {
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: 2101,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Bikes list returns only current user bikes', async ({
    request,
    loginResult,
  }) => {
    await addBikeApi(request, loginResult.body.user.id, {
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: 2021,
    });

    const user_2_email = uniqueEmail();

    await registerUser(request, user_2_email);

    const user_2_login = await loginUser(request, user_2_email);
    const user_2_id = user_2_login.user.id;

    await addBikeApi(request, user_2_id, {
      make: 'Honda',
      model: 'Rebel',
      year: 2020,
    });

    const bikes = await listBikesApi(request, loginResult.body.user.id);

    expect(bikes.length).toBe(1);
    expect(
      bikes.every((bike) => bike.user_id === loginResult.body.user.id),
    ).toBe(true);
    expect(bikes.some((bike) => bike.make === 'Honda')).toBe(false);
  });

  test('Deleting a bike removes it from the database', async ({
    request,
    loginResult,
  }) => {
    const bike_id = await addBike(request, loginResult.body.user.id);

    const deleteResponse = await deleteBikeApi(
      request,
      bike_id,
      loginResult.body.user.id,
    );

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe('Bike deleted successfully');

    const bikes = await listBikesApi(request, loginResult.body.user.id);
    expect(bikes).toHaveLength(0);
  });

  test('Deleting bike removes related jobs', async ({
    request,
    loginResult,
  }) => {
    const bike_id = await addBike(request, loginResult.body.user.id);

    await addJobApi(request, bike_id, loginResult.body.user.id);

    const deleteResponse = await deleteBikeApi(
      request,
      bike_id,
      loginResult.body.user.id,
    );
    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe('Bike deleted successfully');

    const jobsResponse = await listJobsApi(request, loginResult.body.user.id);

    expect(jobsResponse.status()).toBe(200);

    const jobsBody = await jobsResponse.json();
    expect(jobsBody.jobs).toHaveLength(0);
  });
});
